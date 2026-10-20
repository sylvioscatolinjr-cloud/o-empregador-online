import {createHash,timingSafeEqual} from 'node:crypto';
export function validSubscription(input){
 const s=input||{};let url;try{url=new URL(s.endpoint);}catch{throw Error('Inscrição inválida.');}
 const h=url.hostname,allowed=['fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com'].includes(h)||h.endsWith('.notify.windows.com');
 if(url.protocol!=='https:'||url.port||url.username||url.password||!allowed||url.href.length>2048||url.hash)throw Error('Serviço de notificações não reconhecido.');
 const keys=s.keys||{};if(!/^[A-Za-z0-9_-]{87}$/.test(keys.p256dh||'')||!/^[A-Za-z0-9_-]{22}$/.test(keys.auth||''))throw Error('Chaves de inscrição inválidas.');
 return {endpoint:url.href,keys:{p256dh:keys.p256dh,auth:keys.auth}};
}
export const endpointKey=endpoint=>createHash('sha256').update(String(endpoint)).digest('hex');
export function secretMatches(header,secret){if(!secret||typeof header!=='string')return false;const a=Buffer.from(header),b=Buffer.from('Bearer '+secret);return a.length===b.length&&timingSafeEqual(a,b);}
export async function deliverPush({db,webpush,env}){
 const claimed=await db.rpc('portal_push_claim');if(claimed.error)throw Error('Fila indisponível.');let sent=0;
 await Promise.all((claimed.data||[]).map(async job=>{
  let outcome='retry';try{
   const count=await db.from('portal_notifications').select('id',{count:'exact',head:true}).eq('user_id',job.user_id).eq('cohort_id',job.cohort_id).is('read_at',null);if(count.error)throw Error();
   await webpush.sendNotification(validSubscription(job.subscription),JSON.stringify({type:'notice',unread:count.count||0}),{vapidDetails:{subject:env.APP_ORIGIN,publicKey:env.PUSH_VAPID_PUBLIC_KEY,privateKey:env.PUSH_VAPID_PRIVATE_KEY},TTL:3600,timeout:5000,topic:'empregador-avisos'});outcome='sent';sent++;
  }catch(error){if([404,410].includes(error.statusCode))outcome='expired';}
  const result=await db.rpc('portal_push_finish',{p_id:job.id,p_lease:job.lease,p_outcome:outcome});if(result.error)throw Error('Fila não confirmou resultado.');
 }));return {processed:claimed.data?.length||0,sent};
}
