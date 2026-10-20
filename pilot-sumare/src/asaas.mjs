import {timingSafeEqual} from 'node:crypto';

import {monthlyPlan} from './billing-plans.mjs';
export {monthlyPlan} from './billing-plans.mjs';
export function verifyWebhookToken(provided,expected){
 if(typeof expected!=='string'||expected.length<32||typeof provided!=='string'||provided.length>255)return false;
 const a=Buffer.from(provided),b=Buffer.from(expected);
 return a.length===b.length&&timingSafeEqual(a,b);
}
/** Sandbox only. No production switch until the billing lifecycle is validated. */
export function createAsaasSandbox({apiKey,fetchImpl=fetch}){
 if(typeof apiKey!=='string'||!apiKey.trim())throw Error('Configure ASAAS_SANDBOX_API_KEY no servidor.');
 async function request(path,{method='GET',body}={}){
  const response=await fetchImpl('https://api-sandbox.asaas.com/v3'+path,{method,headers:{access_token:apiKey,'Content-Type':'application/json','User-Agent':'OEmpregadorOnline/0.1'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Object.assign(Error('O Asaas não concluiu a solicitação.'),{status:response.status});
  return response.json();
 }
 return Object.freeze({
  async createSubscription({customerId,profileType,tier,nextDueDate,reference,billingType='UNDEFINED'}){
   const plan=monthlyPlan(profileType,tier);
   if(plan.cents===0)throw Error('Plano gratuito não gera cobrança.');
   if(!/^cus_[A-Za-z0-9]+$/.test(customerId||'')||!/^\d{4}-\d{2}-\d{2}$/.test(nextDueDate||'')||!['UNDEFINED','BOLETO','PIX'].includes(billingType)||!/^bill_[A-Za-z0-9-]{16,100}$/.test(reference||''))throw Error('Dados de assinatura inválidos.');
   const date=new Date(nextDueDate+'T12:00:00Z');
   if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==nextDueDate)throw Error('Vencimento inválido.');
   // Never retry this POST automatically: a timeout can mean the subscription exists.
   return request('/subscriptions',{method:'POST',body:{customer:customerId,billingType,value:plan.cents/100,nextDueDate,cycle:plan.cycle,description:`O Empregador Online — ${profileType} — Nível ${tier}`,externalReference:reference}});
  },
  async getPayment(paymentId){
   if(!/^pay_[A-Za-z0-9]+$/.test(paymentId||''))throw Error('Cobrança inválida.');
   return request('/payments/'+encodeURIComponent(paymentId));
  }
 });
}
