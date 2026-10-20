import {createClient} from '@supabase/supabase-js';
import {verifyWebhookToken} from '../src/asaas.mjs';
import {quotePlan} from '../src/billing-plans.mjs';
import {LIVE_TERMS,liveEvents,liveId,liveCheckoutURL,liveCheckoutBody,liveRequestFactory,livePayment,currentEntitlement,syncLiveOrder} from '../src/billing-live.mjs';
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const assertResult=r=>{if(r.error)throw Error('Não foi possível salvar a operação financeira.');return r.data;};
export function subscriptionsHandler({env=process.env,clientFactory=createClient,fetchImpl=fetch}={}) {return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Método inválido.'});
 const e=env;
 if(req.method==='GET'&&req.query?.action==='config'){if(!e.SUPABASE_URL||!e.SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_')||!e.APP_ORIGIN)return res.status(503).json({error:'Configuração indisponível.'});return res.status(200).json({supabaseURL:e.SUPABASE_URL,publishableKey:e.SUPABASE_PUBLISHABLE_KEY,origin:e.APP_ORIGIN});}
 if(!e.SUPABASE_SECRET_KEY||!e.SUPABASE_URL||!e.ASAAS_PRODUCTION_API_KEY||!e.ASAAS_PRODUCTION_WEBHOOK_TOKEN)return res.status(503).json({error:'Cobrança real em configuração.'});
 const db=clientFactory(e.SUPABASE_URL,e.SUPABASE_SECRET_KEY,options),request=liveRequestFactory(e,fetchImpl);
 try{
 if(req.query?.action==='webhook'){
  if(req.method!=='POST'||!verifyWebhookToken(req.headers['asaas-access-token'],e.ASAAS_PRODUCTION_WEBHOOK_TOKEN))return res.status(401).json({error:'Não autorizado.'});
  const b=req.body;if(!b||JSON.stringify(b).length>65536||typeof b.id!=='string'||!b.id.startsWith('evt_')||b.id.length>200)return res.status(400).json({error:'Evento inválido.'});
  if(!liveEvents.includes(b.event))return res.status(200).json({ignored:true});
  const resource=b.event.startsWith('CHECKOUT_')?b.checkout:b.event.startsWith('PAYMENT_')?b.payment:b.subscription;liveId(resource?.id);
  const exists=assertResult(await db.from('billing_live_events').select('processed_at').eq('id',b.id).maybeSingle());if(exists?.processed_at)return res.status(200).json({received:true});
  if(!exists){const saved=await db.from('billing_live_events').insert({id:b.id,event_type:b.event,resource_id:resource.id});if(saved.error&&saved.error.code!=='23505')throw Error();}
  if(b.event.startsWith('CHECKOUT_')){
   const order=assertResult(await db.from('billing_live_orders').select('*').eq('checkout_id',resource.id).maybeSingle());
   if(!order)return res.status(503).json({error:'Vínculo do pedido ainda em processamento.'});
   if(['CHECKOUT_CANCELED','CHECKOUT_EXPIRED'].includes(b.event)){assertResult(await db.from('billing_live_orders').update({status:b.event==='CHECKOUT_EXPIRED'?'expired':'canceled'}).eq('id',order.id).in('status',['creating','pending']));}
   else await syncLiveOrder(db,request,order);
  } else if(b.event.startsWith('PAYMENT_')){
   const checkedAt=new Date().toISOString(),p=await request('/payments/'+encodeURIComponent(liveId(resource.id,'pay_')));
   if(p.subscription){const order=assertResult(await db.from('billing_live_orders').select('*').eq('subscription_id',p.subscription).maybeSingle());if(order)assertResult(await db.rpc('billing_live_apply_payment',{p_order:order.id,p_payment:livePayment(p,order,checkedAt)}));}
  }else if(b.event==='SUBSCRIPTION_DELETED'){
   // Authenticated provider deletion terminates future renewals, not paid periods.
   assertResult(await db.from('billing_live_orders').update({status:'canceled',canceled_at:new Date().toISOString()}).eq('subscription_id',resource.id));
  }
  assertResult(await db.from('billing_live_events').update({processed_at:new Date().toISOString()}).eq('id',b.id));return res.status(200).json({received:true});
 }
 const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];if(!token)return res.status(401).json({error:'Entre na sua conta.'});
 const auth=await db.auth.getUser(token),u=auth.data?.user;if(auth.error||!u?.email_confirmed_at||u.banned_until&&Date.parse(u.banned_until)>Date.now())return res.status(401).json({error:'Entre com uma conta confirmada.'});
 const member=assertResult(await db.from('pilot_memberships').select('role,status,is_fictitious').eq('user_id',u.id).eq('cohort_id',e.PILOT_COHORT_ID).maybeSingle());
 if(!member||member.status!=='active'||member.is_fictitious||!['learner','recruiter','school_staff','pilot_owner'].includes(member.role))return res.status(403).json({error:'Conta sem autorização para contratar.'});
 const profile={learner:'Candidato',pilot_owner:'Candidato',recruiter:'Empresa',school_staff:'Instituição de Ensino'}[member.role];
 const config=assertResult(await db.from('billing_live_configuration').select('*').eq('id',true).single());
 if(req.method==='GET'){
  const orders=assertResult(await db.from('billing_live_orders').select('*').eq('user_id',u.id).order('created_at',{ascending:false}).limit(50));
  const payments=orders.length?assertResult(await db.from('billing_live_payments').select('*').in('order_id',orders.map(o=>o.id))):[];
  return res.status(200).json({environment:'production',profile,owner:member.role==='pilot_owner',ready:config.connected&&config.account_approved&&config.webhook_ready,canPurchase:member.role==='pilot_owner',termsVersion:LIVE_TERMS,entitlement:currentEntitlement(orders,payments),orders:orders.map(o=>({...o,url:o.checkout_id&&o.status==='pending'?liveCheckoutURL(o.checkout_id):null})),payments});
 }
 if(req.headers.origin!==e.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'Origem inválida.'});
 if(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>4096)return res.status(400).json({error:'Formato inválido.'});
 const b=req.body||{};
 if(b.action==='sync'){const order=assertResult(await db.from('billing_live_orders').select('*').eq('id',b.id).eq('user_id',u.id).single());await syncLiveOrder(db,request,order);return res.status(200).json({synced:true});}
 // Re-authenticate money-changing operations with this account's password; no delegated organization id.
 if(typeof b.password!=='string'||b.password.length>200)return res.status(400).json({error:'Confirme sua senha.'});
 const verifier=clientFactory(e.SUPABASE_URL,e.SUPABASE_PUBLISHABLE_KEY,options),proof=await verifier.auth.signInWithPassword({email:u.email,password:b.password});
 if(proof.error||proof.data?.user?.id!==u.id)return res.status(403).json({error:'Não foi possível confirmar sua senha.'});
 if(proof.data?.session)await verifier.auth.signOut({scope:'local'});
 if(b.action==='cancel'){
  let o=assertResult(await db.from('billing_live_orders').select('*').eq('id',b.id).eq('user_id',u.id).single());o=await syncLiveOrder(db,request,o);
  if(!o.subscription_id)return res.status(409).json({error:'Ainda não há assinatura confirmada. O link de checkout expira em uma hora.'});
  assertResult(await db.from('billing_live_orders').update({cancel_requested_at:new Date().toISOString()}).eq('id',o.id));
  try{await request('/subscriptions/'+encodeURIComponent(liveId(o.subscription_id,'sub_')),{method:'DELETE'});}catch(error){if(error.providerStatus!==404)throw error;}
  assertResult(await db.from('billing_live_orders').update({status:'canceled',canceled_at:new Date().toISOString()}).eq('id',o.id));return res.status(200).json({canceled:true});
 }
 if(b.action==='checkout'&&member.role!=='pilot_owner')return res.status(403).json({error:'Contratação em validação pelo proprietário. A abertura aos assinantes aguarda a ativação dos benefícios.'});
 if(b.action!=='checkout')return res.status(400).json({error:'Ação inválida.'});
 if(!config.connected||!config.account_approved||!config.webhook_ready)return res.status(503).json({error:'A ativação financeira ainda está em validação.'});
 if(b.termsVersion!==LIVE_TERMS||b.accept!==true)return res.status(400).json({error:'Leia e aceite as condições da contratação.'});
 const wishes=assertResult(await db.from('portal_course_wishlists').select('user_id').eq('user_id',u.id).maybeSingle());if(!wishes)return res.status(400).json({error:'Preencha sua lista de cursos desejados antes de contratar.'});
 let q;try{q=quotePlan(profile,Number(b.tier),b.cycle);}catch{return res.status(400).json({error:'Plano inválido.'});}if(!q.cents)return res.status(400).json({error:'O plano gratuito não gera cobrança.'});
 const recent=assertResult(await db.from('billing_live_orders').select('id').eq('user_id',u.id).gte('created_at',new Date(Date.now()-3600000).toISOString()));if(recent.length>=3)return res.status(429).json({error:'Limite de tentativas atingido. Confira seu histórico.'});
 const old=assertResult(await db.from('billing_live_orders').select('id').eq('user_id',u.id));if(old.length){const paid=assertResult(await db.from('billing_live_payments').select('id').in('order_id',old.map(o=>o.id)).eq('eligible',true).gt('period_end',new Date().toISOString()).limit(1));if(paid.length)return res.status(409).json({error:'Você já tem um período pago. A troca de plano ficará disponível após o fim desse período.'});}
 const created=await db.from('billing_live_orders').insert({user_id:u.id,cohort_id:e.PILOT_COHORT_ID,profile_type:profile,tier:q.tier,cycle:q.cycle,cents:q.cents,credit_cents:q.aiCreditCents,months:q.months,terms_version:LIVE_TERMS}).select('*').single();
 if(created.error)return res.status(409).json({error:'Já existe uma contratação aberta. Confira seu histórico antes de repetir.'});const o=created.data;
 try{
  const checkout=await request('/checkouts',{method:'POST',body:liveCheckoutBody(o,e.APP_ORIGIN)});liveId(checkout.id);
  assertResult(await db.from('billing_live_orders').update({checkout_id:checkout.id,status:'pending'}).eq('id',o.id));
  return res.status(200).json({id:o.id,url:liveCheckoutURL(checkout.id)});
 }catch(error){await db.from('billing_live_orders').update({status:error.providerStatus>=400&&error.providerStatus<500&&![408,409,429].includes(error.providerStatus)?'failed':'review'}).eq('id',o.id).eq('status','creating');return res.status(503).json({error:'Tentativa registrada. Não repita a compra antes da conferência; o resultado ainda não foi confirmado.'});}
 }catch{return res.status(503).json({error:'Não foi possível concluir a operação. Consulte o histórico antes de repetir.'});}
};}
export default subscriptionsHandler();
