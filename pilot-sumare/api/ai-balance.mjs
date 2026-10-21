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
   const orders=await db.from('billing_live_orders').select('id').eq('user_id',user.id);
   if(orders.error)throw Error('orders');
   const payments=orders.data?.length?await db.from('billing_live_payments').select('credit_cents,spent_cents,period_start,period_end,eligible').in('order_id',orders.data.map(o=>o.id)):{data:[],error:null};
   if(payments.error)throw Error('payments');
   const now=Date.now();
   const availableCents=(payments.data||[]).filter(p=>p.eligible&&Date.parse(p.period_start)<=now&&Date.parse(p.period_end)>now).reduce((sum,p)=>sum+Math.max(0,p.credit_cents-p.spent_cents),0);
   return res.status(200).json({availableCents,availableCalls:Math.floor(availableCents/100),unit:'BRL_CENT',active:env.AI_CHAT_METERING_ENABLED==='true'});
  }catch{return res.status(503).json({error:'Saldo temporariamente indisponível.'});}
 };
}
export default aiBalanceHandler();
