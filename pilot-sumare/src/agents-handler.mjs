import {createClient} from '@supabase/supabase-js';
import {generateJobDraft,validateInput} from './job-writer-agent.mjs';
import {generateResumeReview,resumeInput} from './resume-reviewer-agent.mjs';
import {meteredRun} from './agent-metering.mjs';
import {readTaskTier} from './ai-task-access.mjs';
const profileColumns='display_name,about,skills,certifications,experience,education,courses,resume_details';
// Context comes from the database, never from the browser: the organization for ads, the saved resume and goal for reviews.
const agents={
 job_writer:{roles:['recruiter','school_staff','pilot_owner'],denied:'Assistente disponível para recrutadores e instituições de ensino.',task:'job_description',key:'draft',generate:generateJobDraft,
  async input(db,user,cohort,body){const input=validateInput(body);const org=await db.from('portal_organizations').select('name,city,state_code').eq('user_id',user.id).maybeSingle();if(org.error)throw Error('Permissões indisponíveis.');if(org.data?.name)input.organization=org.data.name.slice(0,160);return input;},
  size:i=>i.notes.length},
 resume_reviewer:{roles:['learner','pilot_owner'],denied:'Revisão disponível na área do candidato.',task:'resume_review',key:'review',generate:generateResumeReview,
  async input(db,user,cohort,body){const [profile,goal]=await Promise.all([db.from('pilot_profiles').select(profileColumns).eq('user_id',user.id).maybeSingle(),db.from('pilot_goals').select('role').eq('user_id',user.id).eq('cohort_id',cohort).maybeSingle()]);if(profile.error||goal.error)throw Error('Permissões indisponíveis.');return resumeInput({profile:profile.data,goal:goal.data,body});},
  size:i=>JSON.stringify(i).length}};
const safeMessage=error=>['A IA ','O rascunho','A revisão','A resposta','Permissões indisponíveis'].some(x=>error.message?.startsWith(x))?error.message:'O assistente não respondeu agora. Tente de novo em instantes.';
export function agentsHandler({clientFactory=createClient,generate,readTier=readTaskTier,env=process.env}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Método inválido.'});
 if(!env.ANTHROPIC_API_KEY||!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Assistente de IA ainda não ativado no servidor.'});
 if(req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'Origem inválida.'});
 if(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>16000)return res.status(400).json({error:'Formato ou tamanho inválido.'});
 const name=req.body?.agent??'job_writer',agent=Object.hasOwn(agents,name)?agents[name]:null;if(!agent)return res.status(400).json({error:'Assistente inválido.'});
 const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}}),cohort=env.PILOT_COHORT_ID;
 try{
  const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];if(!token)return res.status(401).json({error:'Entre na sua conta.'});
  const auth=await db.auth.getUser(token),user=auth.data?.user;if(auth.error||!user?.email_confirmed_at)return res.status(401).json({error:'Entre com e-mail confirmado.'});
  const m=await db.from('pilot_memberships').select('role,status,is_fictitious').eq('cohort_id',cohort).eq('user_id',user.id).maybeSingle();if(m.error)throw Error('Permissões indisponíveis.');
  if(!agent.roles.includes(m.data?.role)||m.data?.status!=='active'||m.data?.is_fictitious)return res.status(403).json({error:agent.denied});
  // Free plans have no assistants: every use costs R$ 1,00 in credits from a paid plan.
  if(m.data.role!=='pilot_owner'){
   if(await readTier(db,user.id,m.data.role)<1)return res.status(403).json({error:'Os assistentes de IA fazem parte dos planos pagos. Cada uso custa R$ 1,00 em créditos do plano.'});
   if(env.AI_CHAT_METERING_ENABLED!=='true')return res.status(503).json({error:'Assistente de IA aguardando a ativação dos créditos.'});
  }
  let input;try{input=await agent.input(db,user,cohort,req.body);}catch(e){if(e.message==='Permissões indisponíveis.')throw e;return res.status(400).json({error:e.message});}
  if(name==='job_writer'&&input.kind==='job'&&m.data.role==='school_staff')return res.status(403).json({error:'Instituições de ensino publicam cursos e treinamentos.'});
  const result=await meteredRun({db,env,userId:user.id,cohort,agent:name,task:agent.task,inputChars:agent.size(input),safe:safeMessage,
   run:async()=>{const out=await (generate||agent.generate)(input,{apiKey:env.ANTHROPIC_API_KEY,model:env.AGENT_AI_MODEL});return {...out,history:{[agent.key]:out[agent.key]}};}});
  if(!result.ok)return res.status(result.status).json({error:result.error});
  return res.status(200).json({[agent.key]:result.out[agent.key],charge:result.charge,remainingCreditCents:result.remainingCreditCents});
 }catch(error){return res.status(503).json({error:safeMessage(error)});}
};}
