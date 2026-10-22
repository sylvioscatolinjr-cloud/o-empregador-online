import {personalAgentRole} from './personal-agent-role.mjs';
import {createClient} from '@supabase/supabase-js';
import {readTaskTier} from './ai-task-access.mjs';
import {getGuidedTasks,getAgentCatalog} from './ai-agent-catalog.mjs';

/** Authenticated, read-only capability discovery. No model invocation or billing. */
export function agentCatalogHandler({env=process.env,clientFactory=createClient}={}){
 return async function handler(req,res){
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Método não permitido.'});}
  const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];
  if(!token||token.length>8192)return res.status(401).json({error:'Entre na sua conta.'});
  if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)
   return res.status(503).json({error:'Serviço indisponível.'});
  try{
   const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
   const {data,error}=await db.auth.getUser(token),user=data?.user;
   if(error||!user?.email_confirmed_at||user.banned_until&&Date.parse(user.banned_until)>Date.now())
    return res.status(401).json({error:'Confirme sua conta para continuar.'});
   const member=await db.from('pilot_memberships').select('role,status,is_fictitious').eq('cohort_id',env.PILOT_COHORT_ID).eq('user_id',user.id).maybeSingle();
   if(member.error)throw Error('membership lookup');
   if(member.data?.status!=='active'||member.data?.is_fictitious)return res.status(403).json({error:'Acesso não autorizado.'});
   const role=personalAgentRole(member.data.role),catalog=getAgentCatalog(role);
   if(!catalog)return res.status(403).json({error:'Perfil sem agente habilitado.'});
   const tier=await readTaskTier(db,user.id,role,env.PILOT_COHORT_ID);
   const tasks=getGuidedTasks(role,tier).map(({instruction,...task})=>task);
   return res.status(200).json({agent:catalog,tier,tasks,available:tasks.some(t=>t.available),message:'Revisão conectada ao currículo do candidato; demais tarefas com texto informado.'});
  }catch{return res.status(503).json({error:'Não foi possível verificar o acesso.'});}
 };
}
export default agentCatalogHandler();
