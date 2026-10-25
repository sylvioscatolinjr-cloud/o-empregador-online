import {verifiedAiAllowance} from './ai-entitlement.mjs';
import {AGENT_ROLES} from './ai-agent-catalog.mjs';
const profiles={candidate:'Candidato',company:'Empresa',institution:'Instituição de Ensino'};
export async function readTaskTier(db,userId,role,cohortId){
 if(typeof cohortId!=='string'||!cohortId)throw Error('cohort unavailable');
 const orders=await db.from('billing_live_orders').select('id,user_id,cohort_id,profile_type,tier,cycle,cents,terms_version').eq('user_id',userId).eq('cohort_id',cohortId);
 if(orders.error)throw Error('orders unavailable');
 const eligibleOrders=(orders.data||[]).filter(order=>order.user_id===userId&&order.cohort_id===cohortId&&order.profile_type===profiles[AGENT_ROLES[role]]);
 if(!eligibleOrders.length)return 0;
 const payments=await db.from('billing_live_payments').select('id,order_id,eligible,cents,credit_cents,period_start,period_end').in('order_id',eligibleOrders.map(o=>o.id));
 if(payments.error)throw Error('payments unavailable');
 let tier=0;
 for(const order of eligibleOrders){
  if(order.user_id!==userId||order.profile_type!==profiles[AGENT_ROLES[role]])continue;
  if((payments.data||[]).some(payment=>verifiedAiAllowance(order,payment)))tier=Math.max(tier,order.tier);
 }
 return tier;
}
