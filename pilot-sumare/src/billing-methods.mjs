import {quotePlan,nextCycleDate} from './billing-plans.mjs';
export const methodEvents=['PAYMENT_CREATED','PAYMENT_CONFIRMED','PAYMENT_RECEIVED','PAYMENT_OVERDUE','PAYMENT_REFUNDED','PAYMENT_DELETED','PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CREATED','PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED','PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CANCELLED','PIX_AUTOMATIC_RECURRING_AUTHORIZATION_EXPIRED','PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REFUSED'];
export function safeInvoiceURL(value){try{const u=new URL(value);if(u.protocol==='https:'&&u.hostname==='sandbox.asaas.com'&&!u.username&&!u.password)return u.href;}catch{}return null;}
export function methodBody({method,profileType,tier,cycle,reference,customerId,today}){
 const q=quotePlan(profileType,tier,cycle);if(!q.cents||!['PIX','BOLETO','PIX_AUTOMATIC'].includes(method)||!/^cus_[a-zA-Z0-9]+$/.test(customerId)||!/^[a-f0-9-]{36}$/i.test(reference))throw Error('Cobrança inválida.');
 if(method==='PIX_AUTOMATIC')return {frequency:cycle==='YEARLY'?'ANNUALLY':cycle,contractId:reference.replaceAll('-',''),startDate:nextCycleDate(today,q.months),value:q.cents/100,description:'TESTE O Empregador Online',customerId,immediateQrCode:{expirationSeconds:3600,originalValue:q.cents/100,description:'TESTE assinatura'},paymentCreationMode:'SUBSCRIPTION',retryPolicy:'NOT_ALLOWED'};
 return {customer:customerId,billingType:method,value:q.cents/100,cycle,nextDueDate:today,externalReference:reference,description:`TESTE O Empregador Online — ${q.label}`};
}
export function methodEvent(body){
 if(!body||typeof body.id!=='string'||!body.id.startsWith('evt_')||body.id.length>200||!methodEvents.includes(body.event))throw Error('Evento inválido.');
 const isPayment=body.event.startsWith('PAYMENT_'),r=isPayment?body.payment:body.authorization;
 if(typeof r?.id!=='string'||r.id.length>100||typeof r.status!=='string'||r.status.length>80)throw Error('Recurso inválido.');
 const date=String(body.dateCreated||'');if(!/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(date))throw Error('Data inválida.');
 const at=new Date(date.replace(' ','T')+( /Z$|[+-]\d\d:\d\d$/.test(date)?'':'-03:00'));if(!Number.isFinite(at.getTime()))throw Error('Data inválida.');
 return {id:body.id,event_type:body.event,resource_id:r.id,parent_id:isPayment?r.subscription||null:null,resource_status:r.status,event_at:at.toISOString()};
}
