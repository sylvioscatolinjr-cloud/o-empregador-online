import {createClient} from '@supabase/supabase-js';
import {mountCreditWallet} from './credit-wallet.mjs';
const root=document.querySelector('#wallet'),loading=document.querySelector('#status');let accountId,revision=0;
try{
 const r=await fetch('/api/subscriptions?action=config',{cache:'no-store'}),cfg=await r.json();if(!r.ok||cfg.origin!==location.origin)throw Error('Abra o endereço oficial do portal.');
 const client=createClient(cfg.supabaseURL,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 const session=await client.auth.getSession();if(session.error||!session.data?.session)throw Error('Entre na sua conta para acessar a carteira.');accountId=session.data.session.user.id;
 const clear=()=>{revision++;accountId=null;root.textContent='Sua sessão mudou. Entre novamente na sua conta.';};
 client.auth.onAuthStateChange?.((_event,s)=>{if(accountId&&s?.user?.id!==accountId)clear();});
 const api=async(action,method='GET',body)=>{
 const expected=accountId,rev=revision,s=await client.auth.getSession();if(!expected||s.error||s.data?.session?.user?.id!==expected){clear();throw Error('Entre novamente.');}
 const r=await fetch('/api/subscriptions'+(method==='GET'?'?action='+action:''),{method,cache:'no-store',headers:{Authorization:'Bearer '+s.data.session.access_token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify({...body,action})}:{})});const result=await r.json();
 const current=await client.auth.getSession();if(rev!==revision||current.error||current.data?.session?.user?.id!==expected){clear();throw Error('Entre novamente.');}if(!r.ok)throw Error(result.error||'Carteira indisponível.');return result;
 };
 await mountCreditWallet(root,{api,isCurrent:()=>!!accountId}).show();
}catch(e){root.textContent=e.message||'Carteira indisponível.';root.setAttribute('role','alert');}finally{if(loading)loading.textContent='';}
