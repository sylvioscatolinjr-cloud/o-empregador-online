import {quotePlan} from './billing-plans.mjs';

/**
 * Pure eligibility check. Billing is the source of truth; callers must never
 * grant credits based on client-supplied orders, payments or webhooks alone.
 */
export function verifiedAiAllowance(order,payment,now=Date.now()){
 if(!order||!payment||payment.order_id!==order.id||payment.eligible!==true)return null;
 if(!Number.isInteger(order.tier)||order.tier<1||order.tier>3)return null;
 if(typeof order.user_id!=='string'||!order.user_id||typeof payment.id!=='string'||!payment.id)return null;
 const start=Date.parse(payment.period_start),end=Date.parse(payment.period_end);
 if(!Number.isFinite(start)||!Number.isFinite(end)||!Number.isFinite(now)||start>now||end<=now)return null;
 let quote;
 try{quote=quotePlan(order.profile_type,order.tier,order.cycle);}catch{return null;}
 if(order.cents!==quote.cents||payment.cents!==quote.cents||payment.credit_cents!==quote.aiCreditCents)return null;
 const calls=Math.floor(quote.aiCreditCents/100);
 if(calls<1)return null;
 return Object.freeze({userId:order.user_id,orderId:order.id,paymentId:payment.id,calls,expiresAt:payment.period_end});
}
