import {createClient} from '@supabase/supabase-js';
import {generateJobDraft,validateInput,DEFAULT_MODEL} from '../src/job-writer-agent.mjs';
import {generateResumeReview,validateResumeInput} from '../src/resume-reviewer-agent.mjs';
// Roles mirror portal_agent_reserve, which enforces them again in the database.
const agents={
 job_writer:{roles:['recruiter','school_staff','pilot_owner'],denied:'Assistente disponível para recrutadores e instituições de ensino.',validate:validateInput,generate:generateJobDraft,key:'draft',size:i=>i.notes.length},
 resume_reviewer:{roles:['learner','pilot_owner'],denied:'Revisão disponível na área do candidato.',validate:validateResumeInput,generate:generateResumeReview,key:'review',size:i=>JSON.stringify(i).length}};
export function agentsHandler({clientFactory=createClient,generate,env=process.env}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Método inválido.'});
 if(!env.ANTHROPIC_API_KEY||!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Assistente de IA ainda não ativado no servidor.'});
 if(req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'Origem inválida.'});
 if(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>30000)return res.status(400).json({error:'Formato ou tamanho inválido.'});
 const name=req.body?.agent??'job_writer',agent=Object.hasOwn(agents,name)?agents[name]:null;if(!agent)return res.status(400).json({error:'Assistente inválido.'});
 const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}}),cohort=env.PILOT_COHORT_ID;
 let runId;
 try{
  const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];if(!token)return res.status(401).json({error:'Entre na sua conta.'});
  const auth=await db.auth.getUser(token),user=auth.data?.user;if(auth.error||!user?.email_confirmed_at)return res.status(401).json({error:'Entre com e-mail confirmado.'});
  const m=await db.from('pilot_memberships').select('role,status').eq('cohort_id',cohort).eq('user_id',user.id).maybeSingle();if(m.error)throw Error('Permissões indisponíveis.');
  if(!agent.roles.includes(m.data?.role)||m.data?.status!=='active')return res.status(403).json({error:agent.denied});
  let input;try{input=agent.validate(req.body);}catch(e){return res.status(400).json({error:e.message});}
  if(name==='job_writer'&&input.kind==='job'&&m.data.role==='school_staff')return res.status(403).json({error:'Instituições de ensino publicam cursos e treinamentos.'});
  const reserve=await db.rpc('portal_agent_reserve',{p_actor:user.id,p_cohort:cohort,p_agent:name,p_limit:Number(env.AGENT_DAILY_LIMIT||10),p_input_chars:agent.size(input)});
  if(reserve.error)return res.status(429).json({error:reserve.error.message?.startsWith('Limite diário')?reserve.error.message:'Não foi possível reservar o uso do assistente.'});runId=reserve.data;
  const out=await (generate||agent.generate)(input,{apiKey:env.ANTHROPIC_API_KEY,model:env.AGENT_AI_MODEL||DEFAULT_MODEL});
  await db.rpc('portal_agent_finish',{p_run:runId,p_status:'completed',p_model:out.model,p_usage:out.usage,p_error:null});
  return res.status(200).json({[agent.key]:out[agent.key]});
 }catch(error){
  const safe=['A IA ','O rascunho','A revisão','Permissões indisponíveis'].some(x=>error.message?.startsWith(x))?error.message:'O assistente não respondeu agora. Tente de novo em instantes.';
  if(runId)await db.rpc('portal_agent_finish',{p_run:runId,p_status:'failed',p_model:null,p_usage:{},p_error:safe});
  return res.status(503).json({error:safe});
 }
};}
export default agentsHandler();
