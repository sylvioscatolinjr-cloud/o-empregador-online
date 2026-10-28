import {quotePlan} from './billing-plans.mjs';
import {quoteHighlight,HIGHLIGHT_TERMS} from './highlight-pricing.mjs';
export const WALLET_TERMS='2026-10-28-unified-wallet-v1';
const uuid=v=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v);
export async function unifiedWalletAction({req,res,db,user,member,env,clientFactory,options}){
 const b=req.body||{},action=req.method==='GET'?req.query?.action:b.action;
 if(!['wallet-status','wallet-plan','wallet-plan-cancel','highlight-checkout'].includes(action))return false;
 const send=(code,data)=>{res.status(code).json(data);return true;};
 if(action==='wallet-status'){
 if(req.method!=='GET')return send(405,{error:'Método inválido.'});
 const rollout=await db.from('portal_wallet_rollout').select('enabled').eq('cohort_id',env.PILOT_COHORT_ID).maybeSingle();if(rollout.error)throw Error('rollout');
 const balance=await db.rpc('portal_ai_wallet_balance',{p_user:user.id,p_cohort:env.PILOT_COHORT_ID});if(balance.error)throw Error('wallet');
 const orders=await db.from('billing_live_orders').select('id').eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID);if(orders.error)throw Error('orders');
 const contracts=orders.data.length?await db.from('portal_wallet_subscriptions').select('order_id,next_due,auto_renew,last_error').in('order_id',orders.data.map(o=>o.id)):{data:[]};if(contracts.error)throw Error('contracts');
 const statement=await db.from('portal_wallet_purchases').select('id,kind,order_id,cents,created_at').eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).order('created_at',{ascending:false}).limit(100);if(statement.error)throw Error('statement');
 const campaigns=await db.from('portal_campaigns').select('id,charged_cents,sent_at').eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).eq('status','sent').order('sent_at',{ascending:false}).limit(100);if(campaigns.error)throw Error('campaigns');
 const usage=await db.from('portal_ai_wallet_usage').select('request_id,created_at,refunded_at').eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).order('created_at',{ascending:false}).limit(100);if(usage.error)throw Error('usage');
 const lines=usage.data.length?await db.from('portal_ai_wallet_lines').select('request_id,cents').in('request_id',usage.data.map(x=>x.request_id)):{data:[]};if(lines.error)throw Error('lines');
 const transactions=[...statement.data,...campaigns.data.map(x=>({id:x.id,kind:'Turbinar',cents:x.charged_cents,created_at:x.sent_at})),...usage.data.map(x=>({id:x.request_id,kind:x.refunded_at?'IA — devolvido':'IA — plano/recarga',cents:x.refunded_at?0:lines.data.filter(l=>l.request_id===x.request_id).reduce((a,l)=>a+l.cents,0),created_at:x.created_at}))].sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)).slice(0,100);
 return send(200,{paymentMode:'wallet',ready:rollout.data?.enabled===true,canPurchase:rollout.data?.enabled===true&&(member.role==='pilot_owner'||env.PUBLIC_SUBSCRIPTIONS_ENABLED==='true'),walletTermsVersion:WALLET_TERMS,walletBalance:balance.data,walletContracts:contracts.data,transactions});
 }
 if(req.method!=='POST')return send(405,{error:'Método inválido.'});
 if(req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site'||!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(b).length>4096)return send(403,{error:'Origem ou formato inválido.'});
 if(action!=='wallet-plan-cancel'&&(!uuid(b.requestId)||b.walletTermsVersion!==WALLET_TERMS||b.accept!==true))return send(400,{error:'Confira o valor e aceite as condições da carteira unificada.'});
 if(typeof b.password!=='string'||!b.password||b.password.length>200)return send(400,{error:'Confirme sua senha.'});
 const verifier=clientFactory(env.SUPABASE_URL,env.SUPABASE_PUBLISHABLE_KEY,options),proof=await verifier.auth.signInWithPassword({email:user.email,password:b.password});
 if(proof.error||proof.data?.user?.id!==user.id)return send(403,{error:'Não foi possível confirmar sua senha.'});
 if(proof.data?.session)await verifier.auth.signOut({scope:'local'});
 const args={p_user:user.id,p_cohort:env.PILOT_COHORT_ID};let result;
 if(action==='wallet-plan-cancel'){
 if(!uuid(b.id))return send(400,{error:'Assinatura inválida.'});result=await db.rpc('portal_wallet_cancel',{...args,p_order:b.id});
 }else if(action==='wallet-plan'){
 if(member.role!=='pilot_owner'&&env.PUBLIC_SUBSCRIPTIONS_ENABLED!=='true')return send(403,{error:'Novas assinaturas indisponíveis.'});
 const profile={learner:'Candidato',pilot_owner:'Candidato',recruiter:'Empresa',school_staff:'Instituição de Ensino'}[member.role];let q;try{q=quotePlan(profile,Number(b.tier),b.cycle);}catch{return send(400,{error:'Plano inválido.'});}
 if(!q.cents||q.cents!==b.cents)return send(409,{error:'O valor mudou. Atualize os planos.'});
 if(b.affiliateCode){if(!uuid(b.affiliateCode))return send(400,{error:'Indicação inválida.'});const ref=await db.rpc('portal_affiliate_bind',{...args,p_code:b.affiliateCode});if(ref.error)return send(409,{error:'Confira a indicação antes de contratar.'});}
 result=await db.rpc('portal_wallet_plan',{...args,p_request:b.requestId,p_tier:q.tier,p_cycle:q.cycle,p_expected:q.cents,p_terms:WALLET_TERMS});
 }else{
 if(env.HIGHLIGHT_SALES_ENABLED!=='true')return send(503,{error:'Destaques indisponíveis.'});
 let q;try{q=quoteHighlight({role:member.role==='pilot_owner'?'learner':member.role,kind:b.kind,days:b.days,verifiedTier:b.tier});}catch{return send(400,{error:'Destaque inválido.'});}
 if(q.cents!==b.cents||b.termsVersion!==HIGHLIGHT_TERMS||!uuid(b.targetId))return send(409,{error:'Confira o item e atualize o orçamento.'});
 result=await db.rpc('portal_wallet_highlight',{...args,p_request:b.requestId,p_kind:b.kind,p_target:b.targetId,p_days:b.days,p_tier:b.tier,p_expected:b.cents,p_terms:HIGHLIGHT_TERMS});
 }
 if(result.error)return send(409,{error:result.error.message?.includes('existing subscription')?'Já existe uma assinatura ou período pago. Para mudar à carteira, cancele a renovação anterior e aguarde o fim do período; nenhuma cobrança duplicada será criada.':result.error.message?.includes('wishlist')?'Preencha sua lista de cursos desejados antes de contratar.':'Não foi possível confirmar. Atualize o histórico antes de repetir; confira saldo, preço e permissões.'});
 return send(200,result.data||{canceled:true});
}
