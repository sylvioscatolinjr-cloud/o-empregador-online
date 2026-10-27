import {randomUUID,timingSafeEqual} from 'node:crypto';
import {highlightCheckoutBody,highlightPayment} from './highlight-checkout.mjs';
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
 const returned=await request('/payments?checkoutSession='+encodeURIComponent(id)+'&limit=100');
 if(!Array.isArray(returned?.data)||returned.hasMore)throw Error('Não foi possível conferir as cobranças vinculadas ao checkout.');
 return {id,checkoutURL:'https://sandbox.asaas.com/checkoutSession/show?id='+encodeURIComponent(id),reference:order.id,cents:order.cents,payments:returned.data.length};
}

export async function inspectHighlightSandbox({key,checkoutId,fetchImpl=fetch}) {
 if(typeof key!=='string'||!key.trim())throw Error('Chave Sandbox ausente.');
 const id=liveId(checkoutId);
 const request=async(path)=>{
  const response=await fetchImpl('https://api-sandbox.asaas.com/v3'+path,{redirect:'error',headers:{access_token:key,'Content-Type':'application/json','User-Agent':'OEmpregadorOnline/1.0'},signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error(`Asaas Sandbox respondeu HTTP ${response.status}.`);
  return response.json();
 };
 const list=await request('/payments?checkoutSession='+encodeURIComponent(id)+'&limit=100');
 if(!Array.isArray(list?.data)||list.hasMore)throw Error('Não foi possível conferir as cobranças.');
 const payments=[];
 for(const item of list.data){
  const fresh=await request('/payments/'+encodeURIComponent(liveId(item.id,'pay_')));
  payments.push(highlightPayment(fresh,{checkout_id:id,cents:990}));
 }
 return {id,payments};
}

// Temporary, sandbox-only control for verifying provider-originated webhooks.
export async function controlSandboxWebhook({key,token,host,action,shareSecret,webhookId,fetchImpl=fetch}) {
 let path,method='POST',body;
 if(action==='create-webhook'){
  if(!/^[-a-z0-9]+\.vercel\.app$/.test(host||'')||!/^[-A-Za-z0-9_]{16,256}$/.test(shareSecret||''))throw Error('Destino de teste inválido.');
  path='/webhooks';
  body={name:'OEO teste temporário de destaque',url:'https://'+host+'/api/subscriptions?action=highlight-sandbox-webhook&_vercel_share='+encodeURIComponent(shareSecret),email:'contato@oempregadoronline.com.br',interrupted:false,enabled:true,authToken:token,events:['PAYMENT_REFUNDED','PAYMENT_REFUND_IN_PROGRESS'],sendType:'SEQUENTIALLY',apiVersion:3};
 }else if(action==='refund-fixture'){
  path='/payments/pay_l9wvx0oeq5fiojba/refund';body={};
 }else if(action==='disable-webhook'){
  path='/webhooks/'+encodeURIComponent(liveId(webhookId));method='PUT';body={enabled:false};
 }else throw Error('Ação inválida.');
 const response=await fetchImpl('https://api-sandbox.asaas.com/v3'+path,{method,redirect:'error',headers:{access_token:key,'Content-Type':'application/json','User-Agent':'OEmpregadorOnline/1.0'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error(`Asaas Sandbox respondeu HTTP ${response.status}.`);
 const result=await response.json();return {id:liveId(result?.id),status:result?.status||null,enabled:result?.enabled??null};
}

export async function sandboxProbeHandler(req,res,{env=process.env,fetchImpl=fetch}={}) {
 res.setHeader('Cache-Control','private, no-store');
 if(env.VERCEL_ENV!=='preview'||env.VERCEL_GIT_COMMIT_REF!=='feat/destaque-pago')return res.status(404).json({error:'Indisponível.'});
 if(req.method!=='POST')return res.status(405).json({error:'Método inválido.'});
 const expected=env.HIGHLIGHT_SANDBOX_PROBE_TOKEN,received=/^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization||'')?.[1];
 if(!/^[a-f0-9]{64}$/.test(expected||'')||!received||!timingSafeEqual(Buffer.from(received),Buffer.from(expected)))return res.status(401).json({error:'Não autorizado.'});
 if(!env.ASAAS_SANDBOX_API_KEY||!/^[-a-z0-9]+\.vercel\.app$/.test(env.VERCEL_URL||''))return res.status(503).json({error:'Sandbox ainda não configurado.'});
 try{if(req.body?.control)return res.status(200).json(await controlSandboxWebhook({key:env.ASAAS_SANDBOX_API_KEY,token:expected,host:env.VERCEL_URL,action:req.body.control,shareSecret:req.body.shareSecret,webhookId:req.body.webhookId,fetchImpl}));return res.status(200).json(req.body?.checkoutId?await inspectHighlightSandbox({key:env.ASAAS_SANDBOX_API_KEY,checkoutId:req.body.checkoutId,fetchImpl}):await checkHighlightSandbox({key:env.ASAAS_SANDBOX_API_KEY,origin:'https://'+env.VERCEL_URL,fetchImpl}));}
 catch(error){return res.status(502).json({error:'Não foi possível verificar o checkout Sandbox.',detail:/HTTP \d{3}/.exec(error.message)?.[0]||'Falha de comunicação'});}
}
