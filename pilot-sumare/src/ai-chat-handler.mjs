import {createClient} from '@supabase/supabase-js';
import {createAgentRequest,AgentPolicyError} from './ai-agent-policy.mjs';
import {readTaskTier} from './ai-task-access.mjs';
import {getGuidedTasks} from './ai-agent-catalog.mjs';
import {generateText} from './ai-provider.mjs';
import {meteredRun} from './agent-metering.mjs';
const config={auth:{persistSession:false,autoRefreshToken:false}};
const COST=1;
const safeMessage=error=>error?.name==='ProviderError'?error.message:'Não foi possível obter a resposta.';
export function aiChatHandler({env=process.env,clientFactory=createClient,generate=generateText}={}){
 return async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Método inválido.'});
  if(req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'Origem inválida.'});
  if(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>9000)return res.status(400).json({error:'Formato inválido.'});
  const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];
  if(!token)return res.status(401).json({error:'Entre na sua conta.'});
  if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Serviço indisponível.'});
  try{
   const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,config);
   const auth=await db.auth.getUser(token),user=auth.data?.user;
   if(auth.error||!user?.email_confirmed_at||user.banned_until&&Date.parse(user.banned_until)>Date.now())return res.status(401).json({error:'Confirme sua conta.'});
   const m=await db.from('pilot_memberships').select('role,status,is_fictitious').eq('cohort_id',env.PILOT_COHORT_ID).eq('user_id',user.id).maybeSingle();
   if(m.error)throw Error('Membership unavailable');
   if(m.data?.status!=='active'||m.data?.is_fictitious)return res.status(403).json({error:'Conta não autorizada.'});
   const task=getGuidedTasks(m.data.role,0).find(t=>t.id===req.body?.taskId);
   if(!task)return res.status(400).json({error:'Selecione uma tarefa válida para seu perfil.'});
   const tier=await readTaskTier(db,user.id,m.data.role);
   if(tier<task.minTier)return res.status(403).json({error:'Esta tarefa exige plano nível '+task.minTier+' ou superior.'});
   let request;
   try{request=createAgentRequest({role:m.data.role,question:req.body?.question,context:req.body?.context});
    request.system+=' Tarefa selecionada: '+task.instruction+' Limite-se a esta tarefa; pedidos de outras tarefas devem ser recusados.';}
   catch(e){if(e instanceof AgentPolicyError)return res.status(e.code==='forbidden'?403:400).json({error:e.message});throw e;}
   // Guided chat is always paid: it stays off until credit metering is switched on.
   if(env.AI_CHAT_METERING_ENABLED!=='true'||!env.ANTHROPIC_API_KEY)
    return res.status(503).json({error:'Chat em preparação: aguardando ativação de créditos e modelo.',agent:request.agent});
   const result=await meteredRun({db,env,userId:user.id,cohort:env.PILOT_COHORT_ID,agent:'guided_chat',task:task.id,inputChars:request.user.length,safe:safeMessage,
    run:async()=>{const out=await generate({system:request.system,user:request.user,model:env.AGENT_AI_MODEL},{apiKey:env.ANTHROPIC_API_KEY});return {...out,history:{question:String(req.body.question).slice(0,4000),answer:out.text}};}});
   if(!result.ok)return res.status(result.status).json({error:result.error});
   return res.status(200).json({answer:result.out.text,agent:request.agent,creditsCharged:COST,remainingCreditCents:result.remainingCreditCents});
  }catch{return res.status(503).json({error:'Não foi possível validar a solicitação.'});}
 };
}
export default aiChatHandler();
