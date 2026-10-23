// Temporary, narrowly scoped recovery of an already authorized purchase attempt.
// Creates only a hosted checkout, never submits payer/card data or pays a charge.
import {createClient} from '@supabase/supabase-js';
import {topupCheckoutBody,TOPUP_TERMS} from '../src/ai-topups.mjs';
export async function recoverOwnerTopup(env=process.env,{clientFactory=createClient,fetchImpl=fetch}={}){
 if(env.VERCEL_ENV!=='production'||!env.OEO_OWNER_TEST_USER_ID||!env.ASAAS_PRODUCTION_API_KEY)return;
 const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const found=await db.from('portal_ai_topup_orders').select('*').eq('user_id',env.OEO_OWNER_TEST_USER_ID).eq('cohort_id',env.PILOT_COHORT_ID).eq('created_at','2026-10-23T12:54:55.592951+00:00').maybeSingle();
 const o=found.data;if(found.error)throw Error('Recovery lookup failed');
 if(!o||o.status!=='failed'||o.checkout_id||o.cents!==1000||o.terms_version!==TOPUP_TERMS){console.info('TOPUP_RECOVERY_SKIPPED');return;}
 const member=await db.from('pilot_memberships').select('role,status,is_fictitious').eq('user_id',o.user_id).eq('cohort_id',o.cohort_id).maybeSingle();
 if(member.error||member.data?.role!=='pilot_owner'||member.data?.status!=='active'||member.data?.is_fictitious)throw Error('Recovery actor invalid');
 const verified=await db.rpc('portal_ai_wallet_balance',{p_user:o.user_id,p_cohort:o.cohort_id});if(verified.error)throw Error('Recovery actor verification failed');
 const lock=await db.from('portal_ai_topup_orders').update({status:'review'}).eq('id',o.id).eq('status','failed').is('checkout_id',null).select('id');if(lock.error||lock.data?.length!==1)return;
 try{
 const r=await fetchImpl('https://api.asaas.com/v3/checkouts',{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{access_token:env.ASAAS_PRODUCTION_API_KEY,'Content-Type':'application/json','User-Agent':'OEmpregadorOnline/1.0'},body:JSON.stringify(topupCheckoutBody(o,env.APP_ORIGIN))});
 const data=await r.json();
 if(!r.ok){
  const safe=(data.errors||[]).slice(0,4).map(e=>({code:/^[a-z_]{1,60}$/.test(e.code||'')?e.code:'unknown',description:String(e.description||'').replaceAll(env.ASAAS_PRODUCTION_API_KEY,'[redacted]').replace(/https?:\/\/\S+|[\w.+-]+@[\w.-]+|[A-Za-z0-9_-]{32,}/g,'[redacted]').slice(0,250)}));
  console.error('TOPUP_RECOVERY_REJECTED '+JSON.stringify({status:r.status,errors:safe}));
  if(r.status>=400&&r.status<500&&![408,409,429].includes(r.status))await db.from('portal_ai_topup_orders').update({status:'failed'}).eq('id',o.id).eq('status','review');
  return;
 }
 if(typeof data.id!=='string'||!/^[A-Za-z0-9_-]{1,100}$/.test(data.id))throw Error('Unexpected checkout reference');
 const save=await db.from('portal_ai_topup_orders').update({status:'pending',checkout_id:data.id}).eq('id',o.id).eq('status','review');if(save.error)throw Error('Recovery save failed');
 console.info('TOPUP_RECOVERY_CHECKOUT_CREATED');
 }catch{console.error('TOPUP_RECOVERY_UNCERTAIN');}
}
