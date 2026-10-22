import {personalAgentRole} from './personal-agent-role.mjs';
import {randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {createAgentRequest,AgentPolicyError} from './ai-agent-policy.mjs';
import {readTaskTier} from './ai-task-access.mjs';
import {getGuidedTasks} from './ai-agent-catalog.mjs';
const config={auth:{persistSession:false,autoRefreshToken:false}};
const COST=1;
export function aiChatHandler({env=process.env,clientFactory=createClient,fetchImpl=fetch}={}){
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
   const role=personalAgentRole(m.data.role);
   const task=getGuidedTasks(role,0).find(t=>t.id===req.body?.taskId);
   if(!task)return res.status(400).json({error:'Selecione uma tarefa válida para seu perfil.'});
   if(task.id==='resume_review')return res.status(400).json({error:'Use a revisão conectada ao currículo salvo: carregue seus dados na tarefa Revisar meu currículo.'});
   const tier=await readTaskTier(db,user.id,role,env.PILOT_COHORT_ID);
   if(tier<task.minTier)return res.status(403).json({error:'Esta tarefa exige plano nível '+task.minTier+' ou superior.'});
   let request;
   try{request=createAgentRequest({role,question:req.body?.question,context:req.body?.context});
    request.system+=' Tarefa selecionada: '+task.instruction+' Limite-se a esta tarefa; pedidos de outras tarefas devem ser recusados.';}
   catch(e){if(e instanceof AgentPolicyError)return res.status(e.code==='forbidden'?403:400).json({error:e.message});throw e;}
   // This switch is intentionally disabled until wallet grants and tests are validated.
   if(env.AI_CHAT_METERING_ENABLED!=='true'||!env.OPENAI_API_KEY||!env.AI_CHAT_MODEL)
    return res.status(503).json({error:'Chat em preparação: aguardando ativação de créditos e modelo.',agent:request.agent});
   const requestId=randomUUID();
   const reserved=await db.rpc('portal_ai_paid_reserve',{p_user:user.id,p_request:requestId});
   if(reserved.error)return res.status(402).json({error:'Créditos insuficientes ou indisponíveis. Nenhuma chamada à IA foi realizada.'});
   let answer;
   try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),20000);
    try{
     const response=await fetchImpl('https://api.openai.com/v1/responses',{
      method:'POST',signal:controller.signal,
      headers:{Authorization:'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({model:env.AI_CHAT_MODEL,max_output_tokens:1800,store:false,
       input:[{role:'system',content:request.system},{role:'user',content:request.user}]})
     });
     if(!response.ok)throw Error('provider rejected');
     const data=await response.json();
     answer=(data.output||[]).flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text).join('\n').trim();
     if(!answer||data.status==='incomplete')throw Error('incomplete provider response');
    }finally{clearTimeout(timeout);}
   }catch{
    const refund=await db.rpc('portal_ai_paid_refund',{p_user:user.id,p_request:requestId});
    if(refund.error)return res.status(503).json({error:'Falha na IA. A devolução dos créditos requer verificação administrativa.',requestId});
    return res.status(503).json({error:'Não foi possível obter a resposta. Crédito devolvido.'});
   }
   return res.status(200).json({answer,agent:request.agent,creditsCharged:COST,remainingCreditCents:reserved.data,requestId});
  }catch{return res.status(503).json({error:'Não foi possível validar a solicitação.'});}
 };
}
export default aiChatHandler();
