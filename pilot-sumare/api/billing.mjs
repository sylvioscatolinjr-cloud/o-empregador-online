import {quotePlan} from '../src/billing-plans.mjs';
import {methodEvents,methodEvent} from '../src/billing-methods.mjs';
import {createClient} from '@supabase/supabase-js';
import {verifyWebhookToken} from '../src/asaas.mjs';
import {checkoutBody,checkoutURL,asaasRequest,checkoutEvents,validateCheckoutEvent} from '../src/billing-sandbox.mjs';
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');
 const webhook=req.query?.action==='webhook';
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Método inválido.'});
 if(!process.env.SUPABASE_SECRET_KEY||!process.env.ASAAS_SANDBOX_API_KEY||!process.env.ASAAS_WEBHOOK_TOKEN||!process.env.BILLING_TEST_EMAIL)return res.status(503).json({error:'Teste de cobrança ainda em configuração.'});
 const admin=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,options);
 try{
  if(webhook){
   if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
   if(!verifyWebhookToken(req.headers['asaas-access-token'],process.env.ASAAS_WEBHOOK_TOKEN))return res.status(401).json({error:'Não autorizado.'});
   if(JSON.stringify(req.body||{}).length>65536)return res.status(413).json({error:'Evento grande demais.'});
   if(methodEvents.includes(req.body?.event)){let event;try{event=methodEvent(req.body);}catch{return res.status(400).json({error:'Evento inválido.'});}const saved=await admin.rpc('billing_sandbox_method_event',{p_event:event});if(saved.error)throw Error('Falha ao registrar evento.');return res.status(200).json({received:true});}
   let args;try{args=validateCheckoutEvent(req.body);}catch{return res.status(400).json({error:'Evento inválido.'});}
   const saved=await admin.rpc('billing_sandbox_event',args);if(saved.error)throw Error('Falha ao registrar evento.');
   return res.status(200).json({received:true});
  }
  if(req.method==='POST'&&(req.headers.origin!==process.env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site'))return res.status(403).json({error:'Origem inválida.'});
  const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];
  if(!token)return res.status(401).json({error:'Entre na sua conta.'});
  const {data:auth,error}=await admin.auth.getUser(token);const user=auth?.user;
  if(error||!user?.email_confirmed_at)return res.status(401).json({error:'Entre com um e-mail confirmado.'});
  if(user.email?.toLowerCase()!==process.env.BILLING_TEST_EMAIL.toLowerCase())return res.status(403).json({error:'Teste reservado ao responsável do portal.'});
  if(req.method==='GET'){
   const rows=await admin.from('billing_sandbox_orders').select('id,profile_type,tier,cycle,cents,status,checkout_id,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(20);if(rows.error)throw Error('Falha ao consultar assinaturas.');
   const hooks=await asaasRequest('/webhooks');const connected=hooks.data?.some(h=>h.url===process.env.APP_ORIGIN+'/api/billing?action=webhook'&&h.enabled&&!h.interrupted);
   return res.status(200).json({sandbox:true,webhookReady:!!connected,orders:rows.data.map(o=>({...o,url:o.checkout_id&&o.status==='pending'?checkoutURL(o.checkout_id):null}))});
  }
  if(!req.headers['content-type']?.startsWith('application/json'))return res.status(415).json({error:'Use JSON.'});
  if(JSON.stringify(req.body||{}).length>2048)return res.status(413).json({error:'Dados grandes demais.'});
  if(req.body?.action==='setup'){
   const url=process.env.APP_ORIGIN+'/api/billing?action=webhook',hooks=await asaasRequest('/webhooks');
   const existing=hooks.data?.find(h=>h.url===url);const settings={name:'O Empregador Online Sandbox',url,email:user.email,enabled:true,interrupted:false,apiVersion:3,authToken:process.env.ASAAS_WEBHOOK_TOKEN,sendType:'SEQUENTIALLY',events:[...checkoutEvents,...methodEvents]};
   await asaasRequest(existing?'/webhooks/'+encodeURIComponent(existing.id):'/webhooks',{method:existing?'PUT':'POST',body:settings});
   return res.status(200).json({configured:true});
  }
  if(req.body?.action!=='checkout')return res.status(400).json({error:'Ação inválida.'});
const wishes=await admin.from('portal_course_wishlists').select('user_id').eq('user_id',user.id).maybeSingle();if(wishes.error)throw Error();if(!wishes.data)return res.status(409).json({error:'Preencha sua lista de cursos desejados antes de iniciar a assinatura.'});
   const hooks=await asaasRequest('/webhooks');if(!hooks.data?.some(h=>h.url===process.env.APP_ORIGIN+'/api/billing?action=webhook'&&h.enabled&&!h.interrupted))return res.status(409).json({error:'Conecte o webhook antes de criar o checkout.'});
  const profileType=req.body.profileType,tier=req.body.tier,cycle=req.body.cycle||'MONTHLY';let plan;try{plan=quotePlan(profileType,tier,cycle);}catch{return res.status(400).json({error:'Plano inválido.'});}if(!plan.cents)return res.status(400).json({error:'Plano gratuito dispensa pagamento.'});
  const open=await admin.from('billing_sandbox_orders').select('id').eq('user_id',user.id).gte('created_at',new Date(Date.now()-3600000).toISOString());if(open.error)throw Error('Falha ao conferir limite.');if(open.data.length>=5)return res.status(429).json({error:'Limite de cinco testes por hora atingido.'});
  const inserted=await admin.from('billing_sandbox_orders').insert({user_id:user.id,profile_type:profileType,tier,cycle,cents:plan.cents}).select('id').single();
  if(inserted.error)return res.status(409).json({error:'Já há uma tentativa aberta. Consulte o histórico antes de criar outra.'});
  const id=inserted.data.id;
  try{
   const checkout=await asaasRequest('/checkouts',{method:'POST',body:checkoutBody({profileType,tier,reference:id,cycle,origin:process.env.APP_ORIGIN})});
   const url=checkoutURL(checkout.id);
   const saved=await admin.rpc('billing_sandbox_attach',{p_order:id,p_checkout:checkout.id});if(saved.error)throw Error('Falha ao salvar checkout.');
   return res.status(200).json({id,url,sandbox:true});
  }catch{
   await admin.from('billing_sandbox_orders').update({status:'review'}).eq('id',id).eq('user_id',user.id).eq('status','creating');
   return res.status(503).json({error:'Tentativa registrada para conferência. Não foi confirmada; não repita a contratação.'});
  }
 }catch(error){return res.status(503).json({error:error.providerStatus?error.message:'Não foi possível concluir o teste. Nenhum benefício real foi liberado.'});}
}
