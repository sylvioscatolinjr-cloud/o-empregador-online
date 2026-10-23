import {ownerTestAccess,requestedTestRole} from './owner-test-access.mjs';
import {createClient} from '@supabase/supabase-js';
import {getGuidedTasks} from './ai-agent-catalog.mjs';
const clientOptions={auth:{persistSession:false,autoRefreshToken:false}};
// Saved working notes, never proof of payment, model provenance or professional facts.
export function aiHistoryHandler({env=process.env,clientFactory=createClient}={}){
 return async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');
  const action=req.query?.action,method=action==='history-list'?'GET':'POST';
  if(!['history-list','history-save','history-delete'].includes(action))return res.status(404).json({error:'Recurso não encontrado.'});
  if(req.method!==method)return res.status(405).json({error:'Método inválido.'});
  if(method==='POST'&&(req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site'))return res.status(403).json({error:'Origem inválida.'});
  if(method==='POST'&&(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>45000))return res.status(400).json({error:'Formato inválido.'});
  const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];
  if(!token)return res.status(401).json({error:'Entre na sua conta.'});
  if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Histórico indisponível.'});
  try{
   const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,clientOptions),auth=await db.auth.getUser(token),user=auth.data?.user;
   if(auth.error||!user?.email_confirmed_at||user.banned_until&&Date.parse(user.banned_until)>Date.now())return res.status(401).json({error:'Confirme sua conta.'});
   const membership=await db.from('pilot_memberships').select('role,status,is_fictitious').eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).maybeSingle();
   if(membership.error)throw Error();
   const ownerTest=ownerTestAccess(env,user.id,membership.data,requestedTestRole(req));
   const m=membership.data?{...membership.data,role:ownerTest.role}:null,tasks=getGuidedTasks(m?.role,0);
   if(m?.status!=='active'||m.is_fictitious||!tasks.length)return res.status(403).json({error:'Conta não autorizada.'});
   const scoped=()=>db.from('portal_ai_notes').select('id,task_id,question,answer,created_at').eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).eq('profile_role',m.role);
   if(action==='history-list'){
    const result=await scoped().order('created_at',{ascending:false}).limit(100);
    if(result.error)throw Error();
    return res.status(200).json({ownerTesting:ownerTest.enabled,notes:(result.data||[]).map(note=>({...note,label:tasks.find(t=>t.id===note.task_id)?.label||'Orientação salva'}))});
   }
   if(action==='history-delete'){
    if(typeof req.body?.id!=='string'||!/^[0-9a-f-]{36}$/i.test(req.body.id))return res.status(400).json({error:'Registro inválido.'});
    const result=await db.from('portal_ai_notes').delete().eq('id',req.body.id).eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).eq('profile_role',m.role).select('id');
    if(result.error)throw Error();
    if(!result.data?.length)return res.status(404).json({error:'Registro não encontrado.'});
    return res.status(200).json({deleted:true});
   }
   const {taskId,question,answer,consent}=req.body||{};
   if(consent!==true||!tasks.some(t=>t.id===taskId)||typeof question!=='string'||!question.trim()||question.length>4000||typeof answer!=='string'||!answer.trim()||answer.length>20000)return res.status(400).json({error:'Revise o texto e confirme o salvamento privado.'});
   const result=await db.from('portal_ai_notes').insert({user_id:user.id,cohort_id:env.PILOT_COHORT_ID,profile_role:m.role,task_id:taskId,question:question.trim(),answer:answer.trim()}).select('id').single();
   if(result.error)throw Error();
   return res.status(200).json({saved:true,id:result.data.id});
  }catch{return res.status(503).json({error:'Não foi possível acessar o histórico. Tente novamente.'});}
 };
}
