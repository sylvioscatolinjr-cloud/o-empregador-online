import {liveId,liveCheckoutURL} from './billing-live.mjs';
export const TOPUP_TERMS='2026-10-23-ai-topup-v1';
export const TOPUP_AMOUNTS=[1000,2500,5000];
const result=r=>{if(r.error)throw Error('Conferência financeira necessária. Não repita a compra.');return r.data;};
export function topupCheckoutBody(order,origin){
 if(!TOPUP_AMOUNTS.includes(order.cents)||new URL(origin).origin!==origin||!origin.startsWith('https://'))throw Error('Recarga inválida.');
 return {billingTypes:['PIX','CREDIT_CARD'],chargeTypes:['DETACHED'],minutesToExpire:60,externalReference:order.id,
 callback:{successUrl:origin+'/carteira.html?retorno=sucesso',cancelUrl:origin+'/carteira.html?retorno=cancelado',expiredUrl:origin+'/carteira.html?retorno=expirado'},
 items:[{name:'Créditos de IA OEO',description:`Recarga avulsa de ${order.cents/100} créditos de R$ 1,00. Sem assinatura ou renovação automática.`,quantity:1,value:order.cents/100}]};
}
export function topupPayment(payment,order,checkedAt=new Date().toISOString()){
 liveId(payment.id,'pay_');
 if(!order.checkout_id||payment.checkoutSession!==order.checkout_id||payment.subscription||payment.installment)throw Error('Pagamento incompatível com a recarga.');
 const cents=Math.round(Number(payment.value)*100);
 if(cents!==order.cents)throw Error('Valor de recarga incompatível.');
 const refunded=Array.isArray(payment.refunds)&&payment.refunds.some(r=>!['CANCELLED','REFUSED','DENIED'].includes(r.status));
 return {id:payment.id,checkout_id:order.checkout_id,cents,status:String(payment.status).slice(0,80),eligible:['CONFIRMED','RECEIVED'].includes(payment.status)&&!payment.deleted&&!payment.chargeback&&!refunded,checked_at:checkedAt};
}
export async function applyTopupPayment(db,payment,checkedAt){
 if(!payment.checkoutSession)return false;
 liveId(payment.checkoutSession);
 const order=result(await db.from('portal_ai_topup_orders').select('*').eq('checkout_id',payment.checkoutSession).maybeSingle());
 if(!order)return false;
 result(await db.rpc('portal_ai_topup_apply',{p_order:order.id,p_payment:topupPayment(payment,order,checkedAt)}));return true;
}
export async function syncTopup(db,request,order){
 if(!order.checkout_id)return;
 const checkedAt=new Date().toISOString();
 const list=await request('/payments?checkoutSession='+encodeURIComponent(liveId(order.checkout_id))+'&limit=100');
 if(list.hasMore)throw Error('Conferência financeira necessária.');
 // Never trust a callback, browser payment ID or a list item's payment status.
 for(const item of list.data||[]){const fresh=await request('/payments/'+encodeURIComponent(liveId(item.id,'pay_')));result(await db.rpc('portal_ai_topup_apply',{p_order:order.id,p_payment:topupPayment(fresh,order,checkedAt)}));}
}
export async function topupCheckoutEvent(db,request,event,resource){
 const order=result(await db.from('portal_ai_topup_orders').select('*').eq('checkout_id',resource.id).maybeSingle());if(!order)return false;
 if(['CHECKOUT_CANCELED','CHECKOUT_EXPIRED'].includes(event))result(await db.from('portal_ai_topup_orders').update({status:event==='CHECKOUT_EXPIRED'?'expired':'canceled'}).eq('id',order.id).in('status',['creating','pending']));
 else await syncTopup(db,request,order);
 return true;
}
export async function topupAction({req,res,db,user,env,request,config,clientFactory,options}){
 const action=req.method==='GET'?req.query?.action:req.body?.action;
 if(action!=='credits'&&!['credit-checkout','credit-sync'].includes(action))return false;
 const send=(status,body)=>{res.status(status).json(body);return true;};
 if(req.method==='GET'){
 const orders=result(await db.from('portal_ai_topup_orders').select('id,cents,status,checkout_id,created_at').eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).order('created_at',{ascending:false}).limit(50));
 const balance=result(await db.rpc('portal_ai_wallet_balance',{p_user:user.id,p_cohort:env.PILOT_COHORT_ID}));
 return send(200,{...balance,ready:!!(env.AI_TOPUPS_ENABLED!=='false'&&env.ASAAS_PRODUCTION_API_KEY&&env.ASAAS_PRODUCTION_WEBHOOK_TOKEN&&config.connected&&config.account_approved&&config.webhook_ready),termsVersion:TOPUP_TERMS,amounts:TOPUP_AMOUNTS,orders:orders.map(o=>({...o,url:o.checkout_id&&o.status==='pending'?liveCheckoutURL(o.checkout_id):null}))});
 }
 if(req.method!=='POST')return send(405,{error:'Método inválido.'});
 if(req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site')return send(403,{error:'Origem inválida.'});
 if(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>4096)return send(400,{error:'Formato inválido.'});
 const b=req.body;
 if(action==='credit-sync'){
 if(typeof b.id!=='string'||!/^[0-9a-f-]{36}$/i.test(b.id))return send(400,{error:'Recarga inválida.'});
 const order=result(await db.from('portal_ai_topup_orders').select('*').eq('id',b.id).eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).single());
 await syncTopup(db,request,order);
 const balance=result(await db.rpc('portal_ai_wallet_balance',{p_user:user.id,p_cohort:env.PILOT_COHORT_ID}));
 return send(200,{...balance,message:'Conferência concluída. Confira a situação da recarga; o retorno do checkout sozinho não confirma pagamento. Não pague novamente se estiver pendente.'});
 }
 if(env.AI_TOPUPS_ENABLED==='false'||!config.connected||!config.account_approved||!config.webhook_ready)return send(503,{error:'Recargas temporariamente indisponíveis.'});
 if(b.accept!==true||b.termsVersion!==TOPUP_TERMS||!TOPUP_AMOUNTS.includes(b.cents))return send(400,{error:'Escolha a recarga e aceite as condições.'});
 if(typeof b.password!=='string'||!b.password||b.password.length>200)return send(400,{error:'Confirme sua senha.'});
 const verifier=clientFactory(env.SUPABASE_URL,env.SUPABASE_PUBLISHABLE_KEY,options),proof=await verifier.auth.signInWithPassword({email:user.email,password:b.password});
 if(proof.error||proof.data?.user?.id!==user.id)return send(403,{error:'Não foi possível confirmar sua senha.'});
 if(proof.data?.session)await verifier.auth.signOut({scope:'local'});
 const created=await db.rpc('portal_ai_topup_create',{p_user:user.id,p_cohort:env.PILOT_COHORT_ID,p_cents:b.cents,p_terms:TOPUP_TERMS});
 if(created.error)return send(409,{error:'Existe uma tentativa pendente ou o limite de compras foi atingido. Confira seu histórico antes de repetir.'});
 const id=created.data;
 try{
 const checkout=await request('/checkouts',{method:'POST',body:topupCheckoutBody({id,cents:b.cents},env.APP_ORIGIN)});liveId(checkout.id);
 result(await db.from('portal_ai_topup_orders').update({checkout_id:checkout.id,status:'pending'}).eq('id',id).eq('user_id',user.id));
 return send(200,{id,url:liveCheckoutURL(checkout.id)});
 }catch(error){await db.from('portal_ai_topup_orders').update({status:error.providerStatus>=400&&error.providerStatus<500&&![408,409,429].includes(error.providerStatus)?'failed':'review'}).eq('id',id).eq('status','creating');return send(503,{error:'Tentativa registrada. Não repita a compra antes da conferência administrativa.'});}
}
