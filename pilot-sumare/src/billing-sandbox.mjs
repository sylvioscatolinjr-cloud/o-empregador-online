import {quotePlan} from './billing-plans.mjs';
export const checkoutEvents=['CHECKOUT_CREATED','CHECKOUT_PAID','CHECKOUT_CANCELED','CHECKOUT_EXPIRED'];
export function checkoutBody({profileType,tier,reference,origin,cycle='MONTHLY',now=new Date()}){
 const plan=quotePlan(profileType,tier,cycle);if(!plan.cents)throw Error('Plano gratuito não gera cobrança.');
 const url=new URL(origin);if(url.protocol!=='https:'||url.origin!==origin)throw Error('Origem inválida.');
 if(!/^[0-9a-f-]{36}$/i.test(reference))throw Error('Referência inválida.');
 const nextDueDate=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 return {billingTypes:['CREDIT_CARD'],chargeTypes:['RECURRENT'],minutesToExpire:60,externalReference:reference,callback:{successUrl:origin+'/pagamentos.html?retorno=sucesso',cancelUrl:origin+'/pagamentos.html?retorno=cancelado',expiredUrl:origin+'/pagamentos.html?retorno=expirado'},items:[{name:`TESTE — ${profileType} — Nível ${tier}`,description:'Simulação de assinatura. Não concede benefícios reais.',quantity:1,value:plan.cents/100}],subscription:{cycle,nextDueDate}};
}
export async function asaasRequest(path,{method='GET',body,env=process.env,fetchImpl=fetch}={}){
 if(!env.ASAAS_SANDBOX_API_KEY)throw Error('Chave Sandbox ausente.');
 const r=await fetchImpl('https://api-sandbox.asaas.com/v3'+path,{method,headers:{access_token:env.ASAAS_SANDBOX_API_KEY,'Content-Type':'application/json','User-Agent':'OEmpregadorOnline/0.1'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});
 if(!r.ok){let code;try{const body=await r.json();const c=body.errors?.[0]?.code;if(typeof c==='string'&&/^[a-zA-Z0-9_]{1,80}$/.test(c))code=c;}catch{}throw Object.assign(Error('Asaas Sandbox indisponível ou chave incompatível. Não repita a criação sem conferir a tentativa.'),{providerStatus:r.status,providerCode:code});}
 return r.json();
}
export function checkoutURL(id){if(!/^[a-zA-Z0-9-]{10,100}$/.test(id||''))throw Error('Checkout sem identificador válido.');return 'https://sandbox.asaas.com/checkoutSession/show?id='+encodeURIComponent(id);}
export function validateCheckoutEvent(body){
 if(!body||typeof body.id!=='string'||body.id.length>200||!body.id.startsWith('evt_')||!checkoutEvents.includes(body.event)||typeof body.checkout?.id!=='string'||body.checkout.id.length>100)throw Error('Evento inválido.');
 return {p_id:body.id,p_event:body.event,p_checkout:body.checkout.id};
}
