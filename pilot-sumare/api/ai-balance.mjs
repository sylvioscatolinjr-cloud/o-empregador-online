import {createClient} from '@supabase/supabase-js';
const config={auth:{persistSession:false,autoRefreshToken:false}};
export function aiBalanceHandler({env=process.env,clientFactory=createClient}={}){
 return async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');
  if(req.method!=='GET')return res.status(405).json({error:'Método inválido.'});
  const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];
  if(!token)return res.status(401).json({error:'Entre na sua conta.'});
  if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Serviço indisponível.'});
  try{
   const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,config);
   const auth=await db.auth.getUser(token),user=auth.data?.user;
   if(auth.error||!user?.email_confirmed_at||user.banned_until&&Date.parse(user.banned_until)>Date.now())return res.status(401).json({error:'Confirme sua conta.'});
   const member=await db.from('pilot_memberships').select('role,status,is_fictitious').eq('cohort_id',env.PILOT_COHORT_ID).eq('user_id',user.id).maybeSingle();
   if(member.error)throw Error('membership');
   if(member.data?.status!=='active'||member.data?.is_fictitious||!['learner','recruiter','school_staff'].includes(member.data.role))return res.status(403).json({error:'Acesso não autorizado.'});
   const wallet=await db.from('portal_ai_wallets').select('balance').eq('user_id',user.id).maybeSingle();
   if(wallet.error)throw Error('wallet');
   return res.status(200).json({balance:wallet.data?.balance??0,unit:'AI_CALL',active:env.AI_CHAT_METERING_ENABLED==='true'});
  }catch{return res.status(503).json({error:'Saldo temporariamente indisponível.'});}
 };
}
export default aiBalanceHandler();
