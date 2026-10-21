import {createClient} from '@supabase/supabase-js';
import {createAgentRequest,AgentPolicyError} from '../src/ai-agent-policy.mjs';
const config={auth:{persistSession:false,autoRefreshToken:false}};
export function aiChatHandler({env=process.env,clientFactory=createClient,fetchImpl=fetch}={}){
 return async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Método inválido.'});
  if(req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'Origem inválida.'});
  if(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>9000)return res.status(400).json({error:'Formato inválido.'});
  const token=/^Bearer ([^\\s]+)$/.exec(req.headers.authorization||'')?.[1];
  if(!token)return res.status(401).json({error:'Entre na sua conta.'});
  if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Serviço indisponível.'});
  try{
   const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,config);
   const auth=await db.auth.getUser(token),user=auth.data?.user;
   if(auth.error||!user?.email_confirmed_at||user.banned_until&&Date.parse(user.banned_until)>Date.now())return res.status(401).json({error:'Confirme sua conta.'});
   const m=await db.from('pilot_memberships').select('role,status,is_fictitious').eq('cohort_id',env.PILOT_COHORT_ID).eq('user_id',user.id).maybeSingle();
   if(m.error)throw Error('Membership unavailable');
   if(m.data?.status!=='active'||m.data?.is_fictitious)return res.status(403).json({error:'Conta não autorizada.'});
   let request;
   try{request=createAgentRequest({role:m.data.role,question:req.body?.question,context:req.body?.context});}
   catch(e){if(e instanceof AgentPolicyError)return res.status(e.code==='forbidden'?403:400).json({error:e.message});throw e;}
   // Fail closed until metering is atomic: never invoke paid model without an enforced credit reservation.
   if(env.AI_CHAT_METERING_ENABLED!=='true')return res.status(503).json({error:'Chat em preparação: aguardando ativação segura dos créditos de IA.',agent:request.agent});
   return res.status(503).json({error:'Chat ainda não liberado: reserva de créditos não implementada.'});
  }catch{return res.status(503).json({error:'Não foi possível validar a solicitação.'});}
 };
}
export default aiChatHandler();
