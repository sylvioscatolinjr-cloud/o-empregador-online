import {randomUUID} from 'node:crypto';
import {highlightCheckoutBody} from './highlight-checkout.mjs';
import {HIGHLIGHT_TERMS} from './highlight-pricing.mjs';
import {liveId} from './billing-live.mjs';

// This probe only accepts the sandbox key and never changes production billing.
// It creates a single isolated checkout; no customer or actual payment is created.
export async function checkHighlightSandbox({key,origin,fetchImpl=fetch}) {
 if(typeof key!=='string'||!key.trim()) throw Error('Configure a chave exclusiva do Sandbox no ambiente do servidor.');
 const order={id:randomUUID(),role:'learner',kind:'candidate',days:7,tier:0,cents:990,terms_version:HIGHLIGHT_TERMS};
 const body=highlightCheckoutBody(order,origin,['CREDIT_CARD']);
 const request=async(path,method='GET',payload)=>{
  const response=await fetchImpl('https://api-sandbox.asaas.com/v3'+path,{method,redirect:'error',headers:{access_token:key,'Content-Type':'application/json','User-Agent':'OEmpregadorOnline/1.0'},...(payload?{body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error(`Asaas Sandbox respondeu HTTP ${response.status}.`);
  return response.json();
 };
 const created=await request('/checkouts','POST',body);
 const id=liveId(created?.id);
 const returned=await request('/checkouts/'+encodeURIComponent(id));
 if(returned?.id!==id)throw Error('A referência retornada pelo Sandbox não corresponde ao checkout criado.');
 return {id,checkoutURL:'https://sandbox.asaas.com/checkoutSession/show?id='+encodeURIComponent(id),reference:order.id,cents:order.cents};
}
