import {createClient} from '@supabase/supabase-js';
import {asaasRequest} from '../src/billing-sandbox.mjs';
let healthUntil=0,healthOK=false;
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Use GET.'});
 const e=process.env;
 if(!e.SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_')||!e.APP_ORIGIN||!e.SUPABASE_URL||!e.SUPABASE_SECRET_KEY||!e.ASAAS_WEBHOOK_TOKEN||!e.BILLING_TEST_EMAIL)return res.status(503).json({error:'Configuração indisponível.'});
 if(Date.now()>healthUntil){
  try{
   const admin=createClient(e.SUPABASE_URL,e.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
   const [db]=await Promise.all([admin.from('billing_sandbox_orders').select('id').limit(0),asaasRequest('/webhooks')]);
   healthOK=!db.error;
  }catch{healthOK=false;}
  healthUntil=Date.now()+30000;
 }
 if(!healthOK)return res.status(503).json({error:'A conexão do servidor com o banco ou Asaas Sandbox precisa ser revisada.'});
 return res.status(200).json({supabaseURL:e.SUPABASE_URL,publishableKey:e.SUPABASE_PUBLISHABLE_KEY,origin:e.APP_ORIGIN,sandbox:true});
}
