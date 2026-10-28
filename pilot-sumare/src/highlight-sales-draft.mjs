// Draft: not mounted by subscriptions.mjs. Do not enable sales until the full
// delivery, reconciliation, UI and metrics flows are verified together.
import {availableTopupMethods} from './ai-topups.mjs';
import {liveId,liveCheckoutURL} from './billing-live.mjs';
import {HIGHLIGHT_TERMS,HIGHLIGHT_DURATIONS,quoteHighlight} from './highlight-pricing.mjs';
import {highlightCheckoutBody,highlightPayment} from './highlight-checkout.mjs';
const checked=r=>{if(r.error)throw Error('Falha ao conferir a operação financeira.');return r.data;};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function syncHighlight(db,request,order){
 if(!order.checkout_id)return;
 const checkedAt=new Date().toISOString();
 const list=await request('/payments?checkoutSession='+encodeURIComponent(liveId(order.checkout_id))+'&limit=100');
 if(list.hasMore)throw Error('Conferência adicional necessária.');
 for(const item of list.data||[]){
  const fresh=await request('/payments/'+encodeURIComponent(liveId(item.id,'pay_')));
  checked(await db.rpc('portal_highlight_apply',{p_order:order.id,p_payment:highlightPayment(fresh,order,checkedAt)}));
 }
}
export async function applyHighlightPayment(db,payment,checkedAt){
 if(!payment.checkoutSession)return false;
 liveId(payment.checkoutSession);
 const order=checked(await db.from('portal_highlight_orders').select('*').eq('checkout_id',payment.checkoutSession).maybeSingle());
 if(!order)return false;
 checked(await db.rpc('portal_highlight_apply',{p_order:order.id,p_payment:highlightPayment(payment,order,checkedAt)}));
 return true;
}
export async function highlightCheckoutEvent(db,request,event,resource){
 const order=checked(await db.from('portal_highlight_orders').select('*').eq('checkout_id',resource.id).maybeSingle());
 if(!order)return false;
 if(['CHECKOUT_CANCELED','CHECKOUT_EXPIRED'].includes(event))checked(await db.from('portal_highlight_orders').update({status:event==='CHECKOUT_EXPIRED'?'expired':'canceled'}).eq('id',order.id).in('status',['creating','pending']));
 else await syncHighlight(db,request,order);
 return true;
}
export async function highlightAction({req,res,db,user,member,env,request,config,clientFactory,options}){
 const action=req.method==='GET'?req.query?.action:req.body?.action;
 if(!['highlights','highlight-checkout','highlight-sync'].includes(action))return false;
 const send=(status,body)=>{res.status(status).json(body);return true;};
 if(action==='highlights'?req.method!=='GET':req.method!=='POST')return send(405,{error:'Método inválido.'});
 const role=member.role==='pilot_owner'?'learner':member.role,cohort=env.PILOT_COHORT_ID;
 if(!['learner','recruiter','school_staff'].includes(role))return send(403,{error:'Perfil indisponível.'});
 if(action==='highlights'){
  const tier=checked(await db.rpc('portal_highlight_tier',{p_user:user.id,p_cohort:cohort}));
  const targets=role==='learner'
   ?checked(await db.from('portal_candidate_cards').select('id,name,visible').eq('user_id',user.id).eq('cohort_id',cohort).eq('visible',true).eq('is_fictitious',false))
   :checked(await db.from('portal_listings').select('id,title,kind,status').eq('publisher_id',user.id).eq('cohort_id',cohort).eq('status','published').eq('is_fictitious',false));
  const allowed=role==='learner'?['candidate']:role==='recruiter'?['job']:['course','training'];
  const items=targets.map(x=>role==='learner'?{id:x.id,title:x.name,kind:'candidate'}:{id:x.id,title:x.title,kind:x.kind}).filter(x=>allowed.includes(x.kind));
  const orders=checked(await db.from('portal_highlight_orders').select('id,kind,target_id,days,cents,status,checkout_id,starts_at,ends_at,created_at').eq('user_id',user.id).eq('cohort_id',cohort).order('created_at',{ascending:false}).limit(50));
  const totals=orders.length?checked(await db.rpc('portal_highlight_stats',{p_user:user.id,p_cohort:cohort,p_orders:orders.map(o=>o.id)})):[];
  const metrics=new Map(totals.map(row=>[row.order_id,{views:Number(row.views)||0,clicks:Number(row.clicks)||0}]));
  const prices=Object.fromEntries(allowed.map(kind=>[kind,HIGHLIGHT_DURATIONS.map(days=>quoteHighlight({role,kind,days,verifiedTier:tier}))]));
  const ready=env.HIGHLIGHT_SALES_ENABLED==='true';
  return send(200,{role,tier,items,prices,ready,paymentMode:'wallet',walletTermsVersion:'2026-10-28-unified-wallet-v1',termsVersion:HIGHLIGHT_TERMS,orders:orders.map(o=>({...o,metrics:metrics.get(o.id)||{views:0,clicks:0},url:o.checkout_id&&o.status==='pending'?liveCheckoutURL(o.checkout_id):null}))});
 }
 if(req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site')return send(403,{error:'Origem inválida.'});
 if(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>4096)return send(400,{error:'Formato inválido.'});
 const b=req.body||{};
 if(action==='highlight-sync'){
  if(typeof b.id!=='string'||!UUID.test(b.id))return send(400,{error:'Pedido inválido.'});
  const order=checked(await db.from('portal_highlight_orders').select('*').eq('id',b.id).eq('user_id',user.id).eq('cohort_id',cohort).single());
  if(!order.checkout_id)return send(409,{error:'Este pedido não gerou checkout. Não há pagamento para conferir.'});
  await syncHighlight(db,request,order);
  return send(200,{message:'Conferência concluída. Veja a situação no histórico; não repita um pagamento pendente.'});
 }
 if(env.HIGHLIGHT_SALES_ENABLED!=='true'||!env.ASAAS_PRODUCTION_API_KEY||!env.ASAAS_PRODUCTION_WEBHOOK_TOKEN||!config.connected||!config.account_approved||!config.webhook_ready)return send(503,{error:'Destaques pagos ainda não estão disponíveis.'});
 if(b.accept!==true||b.termsVersion!==HIGHLIGHT_TERMS||typeof b.targetId!=='string'||!UUID.test(b.targetId)||!Number.isInteger(b.days)||!Number.isInteger(b.tier)||!Number.isInteger(b.cents))return send(400,{error:'Confira o item, a duração e as condições.'});
 let q;try{q=quoteHighlight({role,kind:b.kind,days:b.days,verifiedTier:b.tier});}catch{return send(400,{error:'Destaque inválido.'});}
 if(q.cents!==b.cents)return send(400,{error:'O preço informado é inválido.'});
 if(typeof b.password!=='string'||!b.password||b.password.length>200)return send(400,{error:'Confirme sua senha.'});
 const verifier=clientFactory(env.SUPABASE_URL,env.SUPABASE_PUBLISHABLE_KEY,options),proof=await verifier.auth.signInWithPassword({email:user.email,password:b.password});
 if(proof.error||proof.data?.user?.id!==user.id)return send(403,{error:'Não foi possível confirmar sua senha.'});
 if(proof.data?.session)await verifier.auth.signOut({scope:'local'});
 const created=await db.rpc('portal_highlight_create',{p_user:user.id,p_cohort:cohort,p_kind:b.kind,p_target:b.targetId,p_days:b.days,p_expected_tier:b.tier,p_expected_cents:b.cents,p_terms:HIGHLIGHT_TERMS});
 if(created.error)return send(409,{error:'Não foi possível confirmar o preço ou o item, ou já existe uma campanha pendente. Atualize a página e confira o histórico.'});
 const order={id:created.data.id,role,kind:b.kind,days:b.days,tier:created.data.tier,cents:created.data.cents,terms_version:HIGHLIGHT_TERMS};
 try{
  const methods=await availableTopupMethods(request),checkout=await request('/checkouts',{method:'POST',body:highlightCheckoutBody(order,env.APP_ORIGIN,methods)});liveId(checkout.id);
  checked(await db.from('portal_highlight_orders').update({checkout_id:checkout.id,status:'pending'}).eq('id',order.id).eq('user_id',user.id).eq('cohort_id',cohort));
  return send(200,{id:order.id,url:liveCheckoutURL(checkout.id)});
 }catch(error){
  await db.from('portal_highlight_orders').update({status:error.providerStatus>=400&&error.providerStatus<500&&![408,409,429].includes(error.providerStatus)?'failed':'review'}).eq('id',order.id).eq('status','creating');
  return send(503,{error:'Tentativa registrada. Não repita a compra antes da conferência administrativa.'});
 }
}
