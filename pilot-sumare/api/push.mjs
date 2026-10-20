import {createClient} from '@supabase/supabase-js';
import webpush from 'web-push';
import {validSubscription,endpointKey,secretMatches,deliverPush} from '../src/push-service.mjs';
export function pushHandler({factory=createClient,sender=webpush,env=process.env}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(!env.PUSH_VAPID_PUBLIC_KEY||!env.PUSH_VAPID_PRIVATE_KEY||!env.SUPABASE_SECRET_KEY)return res.status(503).json({error:'Notificações ainda não configuradas.'});
 const db=factory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 try{
 if(req.query?.dispatch==='1'){
  if(req.method!=='POST'||!secretMatches(req.headers.authorization,env.PUSH_DISPATCH_SECRET))return res.status(401).json({error:'Não autorizado.'});
  return res.status(200).json(await deliverPush({db,webpush:sender,env}));
 }
 if(!['POST','DELETE'].includes(req.method))return res.status(405).json({error:'Método inválido.'});
 if(req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'Origem inválida.'});
 if(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>6000)return res.status(400).json({error:'Dados inválidos.'});
 const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];if(!token)return res.status(401).json({error:'Entre novamente.'});
 const auth=await db.auth.getUser(token),user=auth.data?.user;if(auth.error||!user?.email_confirmed_at)return res.status(401).json({error:'Entre com e-mail confirmado.'});
 const member=await db.from('pilot_memberships').select('status,is_fictitious').eq('cohort_id',env.PILOT_COHORT_ID).eq('user_id',user.id).maybeSingle();if(member.error)throw Error();if(member.data?.status!=='active'||member.data.is_fictitious)return res.status(403).json({error:'Acesso indisponível.'});
 if(req.method==='DELETE'){
  const r=await db.from('portal_push_subscriptions').delete().eq('user_id',user.id).eq('endpoint_hash',endpointKey(req.body?.endpoint));if(r.error)throw Error();return res.status(200).json({disabled:true});
 }
 let subscription;try{subscription=validSubscription(req.body?.subscription);}catch(error){return res.status(400).json({error:error.message});}
 const r=await db.rpc('portal_push_subscribe',{p_user:user.id,p_cohort:env.PILOT_COHORT_ID,p_hash:endpointKey(subscription.endpoint),p_subscription:subscription});if(r.error)return res.status(409).json({error:'Não foi possível ativar. Desative as notificações deste aparelho e tente novamente.'});
 return res.status(200).json({enabled:true});
 }catch{return res.status(503).json({error:'Não foi possível concluir a operação de notificações.'});}
};}
export default pushHandler();
