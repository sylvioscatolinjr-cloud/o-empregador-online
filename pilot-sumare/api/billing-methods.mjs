import {createClient} from '@supabase/supabase-js';
import {createHash} from 'node:crypto';
import {quotePlan} from '../src/billing-plans.mjs';
import {asaasRequest,checkoutEvents} from '../src/billing-sandbox.mjs';
import {methodBody,methodEvents,safeInvoiceURL} from '../src/billing-methods.mjs';
const opts={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
function fakeDocument(seed,company){let s=[...createHash('sha256').update(seed).digest()].map(v=>v%10).join('').slice(0,company?12:9);if(company){for(const weights of [[5,4,3,2,9,8,7,6,5,4,3,2],[6,5,4,3,2,9,8,7,6,5,4,3,2]]){const r=[...s].reduce((n,c,i)=>n+Number(c)*weights[i],0)%11;s+=r<2?0:11-r;}}else{for(let len=9;len<=10;len++){let d=[...s].reduce((n,c,i)=>n+Number(c)*(len+1-i),0)*10%11;s+=d===10?0:d;}}return s;}
const cleanQR=q=>({pix_payload:typeof q?.payload==='string'&&q.payload.length<=5000?q.payload:null,pix_image:typeof q?.encodedImage==='string'&&q.encodedImage.length<=200000&&/^[A-Za-z0-9+/=]+$/.test(q.encodedImage)?q.encodedImage:null});
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Método inválido.'});
 const e=process.env;if(!e.SUPABASE_SECRET_KEY||!e.ASAAS_SANDBOX_API_KEY||!e.BILLING_TEST_EMAIL||!e.ASAAS_WEBHOOK_TOKEN)return res.status(503).json({error:'Configuração pendente.'});
 if(req.method==='POST'&&(req.headers.origin!==e.APP_ORIGIN||!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>2048))return res.status(403).json({error:'Requisição inválida.'});
 const admin=createClient(e.SUPABASE_URL,e.SUPABASE_SECRET_KEY,opts),token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];
 if(!token)return res.status(401).json({error:'Entre na sua conta.'});
 try{
 const {data,error}=await admin.auth.getUser(token),u=data?.user;if(error||!u?.email_confirmed_at)return res.status(401).json({error:'Entre com e-mail confirmado.'});if(u.email?.toLowerCase()!==e.BILLING_TEST_EMAIL.toLowerCase())return res.status(403).json({error:'Teste restrito ao responsável.'});
 const table=()=>admin.from('billing_sandbox_methods');
 if(req.method==='GET'){
  const rows=await table().select('id,profile_type,tier,cycle,cents,method,status,invoice_url,pix_payload,pix_image,authorization_id,subscription_id,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(15);if(rows.error)throw Error();
  return res.status(200).json({sandbox:true,orders:rows.data});
 }
 if(req.body.action==='details'){
  const row=await table().select('*').eq('id',req.body.id).eq('user_id',u.id).maybeSingle();if(row.error||!row.data)return res.status(404).json({error:'Teste não encontrado.'});const o=row.data;
  if(!o.subscription_id&&!o.authorization_id)return res.status(409).json({error:'Tentativa em conferência. Não repita a contratação.'});
  let extra={},payments=[];
  if(o.authorization_id){const a=await asaasRequest('/pix/automatic/authorizations/'+encodeURIComponent(o.authorization_id));extra={authorizationStatus:a.status};if(a.subscriptionId)o.subscription_id=a.subscriptionId;const qr=cleanQR(a);await table().update({...qr,...(a.subscriptionId?{subscription_id:a.subscriptionId}:{}),...(['CANCELLED','EXPIRED','REFUSED'].includes(a.status)?{status:a.status==='REFUSED'?'failed':'canceled'}:{})}).eq('id',o.id).eq('user_id',u.id);Object.assign(o,qr);}
  if(o.subscription_id){const list=await asaasRequest('/subscriptions/'+encodeURIComponent(o.subscription_id)+'/payments?limit=20');payments=(list.data||[]).map(p=>({id:p.id,status:p.status,value:p.value,dueDate:p.dueDate,url:safeInvoiceURL(p.invoiceUrl)}));const first=o.first_payment_id?payments.find(p=>p.id===o.first_payment_id):[...payments].sort((a,b)=>a.dueDate.localeCompare(b.dueDate))[0];
   if(first){const paid=['CONFIRMED','RECEIVED','RECEIVED_IN_CASH'].includes(first.status);let status=paid?'paid':['DELETED','REFUNDED'].includes(first.status)?'canceled':'pending';const qr=o.method==='PIX'&&!paid?cleanQR(await asaasRequest('/payments/'+encodeURIComponent(first.id)+'/pixQrCode')):{};const patch={first_payment_id:first.id,invoice_url:first.url,status,...qr};const saved=await table().update(patch).eq('id',o.id).eq('user_id',u.id);if(saved.error)throw Error();Object.assign(o,patch);}
  }
  return res.status(200).json({sandbox:true,order:{id:o.id,status:o.status,method:o.method,invoice_url:safeInvoiceURL(o.invoice_url),pix_payload:o.pix_payload,pix_image:o.pix_image},payments,...extra});
 }
 if(req.body.action!=='create')return res.status(400).json({error:'Ação inválida.'});
 const wishes=await admin.from('portal_course_wishlists').select('user_id').eq('user_id',u.id).maybeSingle();if(wishes.error)throw Error();if(!wishes.data)return res.status(409).json({error:'Preencha sua lista de cursos desejados antes de iniciar a assinatura.'});
 const {profileType,tier,cycle,method}=req.body;let quote;try{quote=quotePlan(profileType,tier,cycle);if(!quote.cents||!['PIX','BOLETO','PIX_AUTOMATIC'].includes(method))throw Error();}catch{return res.status(400).json({error:'Plano ou pagamento inválido.'});}
 const hooks=await asaasRequest('/webhooks');if(!hooks.data?.some(h=>h.url===e.APP_ORIGIN+'/api/billing?action=webhook'&&h.enabled&&!h.interrupted&&[...checkoutEvents,...methodEvents].every(v=>h.events?.includes(v))))return res.status(409).json({error:'Clique em Atualizar conexão Asaas antes de testar os novos meios.'});
 const recent=await table().select('id').eq('user_id',u.id).gte('created_at',new Date(Date.now()-3600000).toISOString());if(recent.error)throw Error();if(recent.data.length>=5)return res.status(429).json({error:'Limite de cinco novos testes por hora.'});
 const inserted=await table().insert({user_id:u.id,profile_type:profileType,tier,cycle,cents:quote.cents,method}).select('id').single();if(inserted.error)return res.status(409).json({error:'Já há um teste aberto nessa forma de pagamento. Consulte-o no histórico.'});const id=inserted.data.id;
 try{
  // Dedicated fictitious customer per persisted attempt. No real CPF/CNPJ or notification recipient.
  const customer=await asaasRequest('/customers',{method:'POST',body:{name:'TESTE FICTICIO O Empregador Online',cpfCnpj:fakeDocument(id,profileType!=='Candidato'),notificationDisabled:true,externalReference:id,postalCode:'01001000',addressNumber:'1'}});
  if(!/^cus_[A-Za-z0-9]+$/.test(customer.id||''))throw Error();
  const saveCustomer=await table().update({customer_id:customer.id}).eq('id',id).eq('user_id',u.id);if(saveCustomer.error)throw Error();
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const body=methodBody({method,profileType,tier,cycle,reference:id,customerId:customer.id,today});
  const resource=await asaasRequest(method==='PIX_AUTOMATIC'?'/pix/automatic/authorizations':'/subscriptions',{method:'POST',body});
  if(typeof resource.id!=='string'||!/^[A-Za-z0-9_-]{10,100}$/.test(resource.id))throw Error();
  const patch={status:'pending',...(method==='PIX_AUTOMATIC'?{authorization_id:resource.id,...cleanQR(resource)}:{subscription_id:resource.id})};
  const saved=await table().update(patch).eq('id',id).eq('user_id',u.id);if(saved.error)throw Error();
  return res.status(200).json({sandbox:true,id,message:'Teste registrado. Consulte a cobrança para abrir a fatura ou visualizar o Pix.'});
 }catch(error){const rejected=error.providerStatus>=400&&error.providerStatus<500;await table().update({status:rejected?'failed':'review'}).eq('id',id).eq('user_id',u.id);return res.status(503).json({error:rejected?('O Asaas recusou este teste'+(error.providerCode?' ('+error.providerCode+')':'')+'. Confira a habilitação do meio de pagamento na conta Sandbox.'):method==='PIX_AUTOMATIC'?'O Asaas não concluiu a criação do Pix Automático. A tentativa foi preservada para conferência; pode haver exigência de habilitação da conta.':'O Asaas não concluiu o teste. A tentativa foi preservada para conferência; não repita a contratação.'});}
 }catch{return res.status(503).json({error:'Não foi possível consultar o Asaas Sandbox. Tente novamente mais tarde.'});}
}
