// Operator recovery: GET-only at Asaas; ledger writes require an exact checkout match.
import {createClient} from '@supabase/supabase-js';
import {liveRequestFactory,livePayment,liveId,syncLiveOrder} from '../src/billing-live.mjs';
export async function reconcilePendingLive(env=process.env){
 const db=createClient(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const request=liveRequestFactory(env);
 const {data:orders,error}=await db.from('billing_live_orders').select('*').eq('status','pending').order('created_at',{ascending:false}).limit(20);
 if(error)throw Error('Pending order query failed');
 for(let order of orders){
  try{await syncLiveOrder(db,request,order);}catch{console.info('BILLING_RECOVERY_SYNC '+JSON.stringify({complete:false}));}
  const events=await db.from('billing_live_events').select('resource_id').in('event_type',['PAYMENT_CONFIRMED','PAYMENT_RECEIVED']).gte('received_at',order.created_at).order('received_at',{ascending:false}).limit(20);
  if(events.error)throw Error('Event query failed');
  for(const id of new Set((events.data||[]).map(e=>e.resource_id))){
   const p=await request('/payments/'+encodeURIComponent(liveId(id,'pay_')));
   const match=p.checkoutSession===order.checkout_id;
   console.info('BILLING_RECOVERY_CHECK '+JSON.stringify({checkoutMatch:match,hasSubscription:!!p.subscription,status:p.status,cents:Math.round(Number(p.value)*100),hasCheckout:!!p.checkoutSession,hasExternalReference:!!p.externalReference,externalReferenceMatch:p.externalReference===order.id}));
   if(!match)continue;
   if(p.subscription&&!order.subscription_id){liveId(p.subscription,'sub_');const saved=await db.from('billing_live_orders').update({subscription_id:p.subscription}).eq('id',order.id).is('subscription_id',null);if(saved.error)throw Error('Binding failed');order={...order,subscription_id:p.subscription};}
   const applied=await db.rpc('billing_live_apply_payment',{p_order:order.id,p_payment:livePayment(p,order)});
   if(applied.error)throw Error('Payment reconciliation failed');
  }
 }
 console.info('BILLING_RECOVERY_COMPLETE '+JSON.stringify({ordersChecked:orders.length}));
}
