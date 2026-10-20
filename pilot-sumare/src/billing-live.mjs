import {quotePlan,nextCycleDate} from './billing-plans.mjs';
export const LIVE_TERMS='2026-10-19-v1';
export const liveEvents=['CHECKOUT_CREATED','CHECKOUT_PAID','CHECKOUT_CANCELED','CHECKOUT_EXPIRED','PAYMENT_CREATED','PAYMENT_UPDATED','PAYMENT_CONFIRMED','PAYMENT_RECEIVED','PAYMENT_OVERDUE','PAYMENT_DELETED','PAYMENT_RESTORED','PAYMENT_REFUNDED','PAYMENT_PARTIALLY_REFUNDED','PAYMENT_REFUND_IN_PROGRESS','PAYMENT_REFUND_DENIED','PAYMENT_CHARGEBACK_REQUESTED','PAYMENT_CHARGEBACK_DISPUTE','PAYMENT_AWAITING_CHARGEBACK_REVERSAL','SUBSCRIPTION_DELETED'];
export function liveId(value,prefix=''){if(typeof value!=='string'||value.length>100||!new RegExp('^'+prefix+'[A-Za-z0-9_-]+$').test(value))throw Error('Referência inválida.');return value;}
export function liveCheckoutURL(id){return 'https://asaas.com/checkoutSession/show?id='+encodeURIComponent(liveId(id));}
export function liveRequestFactory(env,fetchImpl=fetch){return async(path,{method='GET',body}={})=>{
 if(!env.ASAAS_PRODUCTION_API_KEY||!/^\/(checkouts|payments|subscriptions|webhooks|myAccount\/status)(\/|\?|$)/.test(path)||path.includes('..'))throw Error('Conexão real indisponível.');
 const response=await fetchImpl('https://api.asaas.com/v3'+path,{method,redirect:'error',headers:{access_token:env.ASAAS_PRODUCTION_API_KEY,'Content-Type':'application/json','User-Agent':'OEmpregadorOnline/1.0'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Object.assign(Error('O Asaas não concluiu a operação. Confira o histórico antes de tentar novamente.'),{providerStatus:response.status});
 return response.status===204?{}:response.json();
};}
export function liveCheckoutBody(order,origin,now=new Date()){
 if(new URL(origin).origin!==origin||!origin.startsWith('https://'))throw Error('Origem inválida.');
 const q=quotePlan(order.profile_type,order.tier,order.cycle);if(!q.cents||q.cents!==order.cents)throw Error('Valor inválido.');
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 return {billingTypes:['CREDIT_CARD'],chargeTypes:['RECURRENT'],minutesToExpire:60,externalReference:order.id,callback:{successUrl:origin+'/assinatura.html?retorno=sucesso',cancelUrl:origin+'/assinatura.html?retorno=cancelado',expiredUrl:origin+'/assinatura.html?retorno=expirado'},items:[{name:`O Empregador Online — Nível ${q.tier}`,description:`${q.profileType} — ${q.label}. Renovação a cada ${q.months} mês(es).`,quantity:1,value:q.cents/100}],subscription:{cycle:q.cycle,nextDueDate:today}};
}
export function livePayment(payment,order,checkedAt=new Date().toISOString()){
 liveId(payment.id,'pay_');if(payment.subscription!==order.subscription_id)throw Error('Assinatura incompatível.');
 const cents=Math.round(Number(payment.value)*100);if(!Number.isSafeInteger(cents)||cents<0)throw Error('Valor inválido.');
 const date=payment.originalDueDate||payment.dueDate;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)throw Error('Período inválido.');
 const end=nextCycleDate(date,order.months);
 const refunded=Array.isArray(payment.refunds)&&payment.refunds.some(r=>!['CANCELLED','REFUSED','DENIED'].includes(r.status));
 return {id:payment.id,status:String(payment.status).slice(0,80),cents,period_start:date+'T00:00:00-03:00',period_end:end+'T00:00:00-03:00',eligible:cents===order.cents&&['CONFIRMED','RECEIVED'].includes(payment.status)&&!payment.deleted&&!payment.chargeback&&!refunded,checked_at:checkedAt};
}
export function currentEntitlement(orders,payments,now=Date.now()){
 const orderMap=new Map(orders.map(o=>[o.id,o]));
 const active=payments.filter(p=>p.eligible&&Date.parse(p.period_start)<=now&&Date.parse(p.period_end)>now&&orderMap.has(p.order_id)).sort((a,b)=>Date.parse(b.period_start)-Date.parse(a.period_start))[0];
 if(!active)return {tier:0,creditCents:0,expiresAt:null};
 return {tier:orderMap.get(active.order_id).tier,creditCents:Math.max(0,active.credit_cents-active.spent_cents),expiresAt:active.period_end,cycleStart:active.period_start};
}
export async function syncLiveOrder(db,request,order){
 if(!order.checkout_id)return order;
 // The checkout filter establishes the subscription binding, never a browser-supplied id.
 if(!order.subscription_id){const r=await request('/payments?checkoutSession='+encodeURIComponent(order.checkout_id)+'&limit=100');
 const subscriptions=[...new Set((r.data||[]).map(p=>p.subscription).filter(Boolean))];
 if(subscriptions.length>1)throw Error('Conferência financeira necessária.');
 if(subscriptions.length===1){liveId(subscriptions[0],'sub_');const saved=await db.from('billing_live_orders').update({subscription_id:subscriptions[0]}).eq('id',order.id).is('subscription_id',null);if(saved.error)throw Error('Falha ao vincular assinatura.');order={...order,subscription_id:subscriptions[0]};}
 }
 if(!order.subscription_id)return order;
 let offset=0,more=true;
 while(more&&offset<1000){const r=await request('/subscriptions/'+encodeURIComponent(order.subscription_id)+'/payments?limit=100&offset='+offset);
 for(const payment of r.data||[]){const checkedAt=new Date().toISOString();const fresh=await request('/payments/'+encodeURIComponent(liveId(payment.id,'pay_')));const p=livePayment(fresh,order,checkedAt);const saved=await db.rpc('billing_live_apply_payment',{p_order:order.id,p_payment:p});if(saved.error)throw Error('Falha ao registrar pagamento.');}
 more=!!r.hasMore;offset+=100;
 }
 if(more)throw Error('Conciliação adicional necessária.');
 return order;
}
