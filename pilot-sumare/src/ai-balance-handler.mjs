import {ownerTestAccess,requestedTestRole} from './owner-test-access.mjs';
import {personalAgentRole} from './personal-agent-role.mjs';
import {createClient} from '@supabase/supabase-js';
const config={auth:{persistSession:false,autoRefreshToken:false}};
export function aiBalanceHandler({env=process.env,clientFactory=createClient}={}){
 return async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');
  if(req.method!=='GET')return res.status(405).json({error:'Método inválido.'});
  const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];
  if(!token)return res.status(401).json({error:'Entre na sua conta.'});
  if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Serviço indisponível.'});
  let stage='client';
  try{
   const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,config);
   stage='auth';
   const auth=await db.auth.getUser(token),user=auth.data?.user;
   if(auth.error||!user?.email_confirmed_at||user.banned_until&&Date.parse(user.banned_until)>Date.now())return res.status(401).json({error:'Confirme sua conta.'});
   stage='membership';
   const member=await db.from('pilot_memberships').select('role,status,is_fictitious').eq('cohort_id',env.PILOT_COHORT_ID).eq('user_id',user.id).maybeSingle();
   if(member.error)throw Object.assign(Error('membership'),{code:member.error.code});
   if(member.data?.status!=='active'||member.data?.is_fictitious||!['learner','recruiter','school_staff'].includes(personalAgentRole(member.data.role)))return res.status(403).json({error:'Acesso não autorizado.'});
   const ownerTest=ownerTestAccess(env,user.id,member.data,requestedTestRole(req));
   if(ownerTest.enabled){const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const usage=await db.from('portal_owner_test_usage').select('calls').eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).eq('usage_day',day).maybeSingle();if(usage.error)throw Error('usage');const availableCalls=Math.max(0,60-Number(usage.data?.calls||0));return res.status(200).json({ownerTesting:true,availableCents:0,availableCalls,unit:'TEST_CALL',active:env.AI_CHAT_METERING_ENABLED==='true'});}
   const wallet=await db.rpc('portal_ai_wallet_balance',{p_user:user.id,p_cohort:env.PILOT_COHORT_ID});
   if(wallet.error)throw Error('wallet');
   return res.status(200).json({...wallet.data,unit:'BRL_CENT',active:env.AI_CHAT_METERING_ENABLED==='true'});
  }catch(error){console.error('AI balance unavailable', {stage,code:/^[A-Z0-9]{3,12}$/.test(error?.code||'')?error.code:'unavailable',credentialType:env.SUPABASE_SECRET_KEY.startsWith('sb_secret_')?'secret':env.SUPABASE_SECRET_KEY.startsWith('sb_publishable_')?'publishable':'other'});return res.status(503).json({error:'Saldo temporariamente indisponível.'});}
 };
}
export default aiBalanceHandler();
