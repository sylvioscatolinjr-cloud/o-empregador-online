import {verifiedAiAllowance} from './ai-entitlement.mjs';
import {AGENT_ROLES} from './ai-agent-catalog.mjs';
const profiles={candidate:'Candidato',company:'Empresa',institution:'Instituição de Ensino'};
export async function readTaskTier(db,userId,role){
 const orders=await db.from('billing_live_orders').select('*').eq('user_id',userId);
 if(orders.error)throw Error('orders unavailable');
 if(!orders.data?.length)return 0;
 const payments=await db.from('billing_live_payments').select('*').in('order_id',orders.data.map(o=>o.id));
 if(payments.error)throw Error('payments unavailable');
 let tier=0;
 for(const order of orders.data){
  if(order.user_id!==userId||order.profile_type!==profiles[AGENT_ROLES[role]])continue;
  if((payments.data||[]).some(payment=>verifiedAiAllowance(order,payment)))tier=Math.max(tier,order.tier);
 }
 return tier;
}
