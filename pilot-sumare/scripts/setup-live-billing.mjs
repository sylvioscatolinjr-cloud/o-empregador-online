import {createClient} from '@supabase/supabase-js';
import {liveRequestFactory,liveEvents,liveId} from '../src/billing-live.mjs';
export async function setupLiveBilling(env=process.env){
 const needed=['ASAAS_PRODUCTION_API_KEY','ASAAS_PRODUCTION_WEBHOOK_TOKEN','SUPABASE_URL','SUPABASE_SECRET_KEY','APP_ORIGIN','BILLING_TEST_EMAIL'];
 if(needed.some(k=>!env[k]))throw Error('Configuração financeira incompleta.');
 if(env.APP_ORIGIN!=='https://www.oempregadoronline.com.br')throw Error('Origem financeira inválida.');
 const db=createClient(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}}),request=liveRequestFactory(env);
 const account=await request('/myAccount/status');
 const url=env.APP_ORIGIN+'/api/subscriptions?action=webhook';
 const list=await request('/webhooks?limit=100');
 if(list.hasMore)throw Error('Conferência dos webhooks necessária.');
 const matches=(list.data||[]).filter(w=>w.url===url);if(matches.length>1)throw Error('Webhook duplicado.');
 const body={name:'O Empregador Online — assinaturas reais',url,email:env.BILLING_TEST_EMAIL,enabled:true,interrupted:false,authToken:env.ASAAS_PRODUCTION_WEBHOOK_TOKEN,events:liveEvents,sendType:'SEQUENTIALLY',apiVersion:3};
 const webhook=await request(matches.length?'/webhooks/'+encodeURIComponent(liveId(matches[0].id)):'/webhooks',{method:matches.length?'PUT':'POST',body});
 const check=await request('/webhooks/'+encodeURIComponent(liveId(webhook.id)));
 const ready=check.enabled===true&&check.interrupted===false&&check.url===url&&liveEvents.every(e=>check.events?.includes(e));
 const saved=await db.from('billing_live_configuration').update({connected:true,account_approved:account.general==='APPROVED',webhook_ready:ready,updated_at:new Date().toISOString()}).eq('id',true);if(saved.error||!ready)throw Error('Ativação financeira não confirmada.');
 return {connected:true,approved:account.general==='APPROVED',webhookReady:ready};
}
