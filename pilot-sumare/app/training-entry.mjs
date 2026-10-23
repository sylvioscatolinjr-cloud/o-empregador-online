import {createClient} from '@supabase/supabase-js';
import {mountTrainings} from './trainings.mjs';
const root=document.querySelector('#trainings');
async function start(){
 try{
  const response=await fetch('/api/config',{cache:'no-store'}),config=await response.json();const cfg=config.ready?config:config.aiPreview;
  if(!response.ok||!cfg||cfg.origin!==location.origin)throw Error('Abra o endereço oficial para consultar os treinamentos.');
  const client=createClient(cfg.supabaseURL,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  const session=await client.auth.getSession();let account=session.data?.session?.user?.id;if(session.error||!account){root.innerHTML='<h1>Meus treinamentos</h1><p>Entre com sua conta para consultar seu perfil e plano.</p><a href="/conta.html">Entrar no portal</a>';return;}
  let current=true,controller;const requestedProfile=new URLSearchParams(location.search||'').get('perfil');
  const invalidate=()=>{current=false;account=null;controller?.clear();};
  client.auth.onAuthStateChange((_event,next)=>{if(account&&next?.user?.id!==account)invalidate();});
  async function api(action,method='GET',body={},id){
   const s=await client.auth.getSession();if(!current||s.error||s.data?.session?.user?.id!==account){invalidate();throw Error('Sua sessão mudou. Entre novamente.');}
   const response=await fetch('/api/ai?action=training-'+action+(id?'&id='+encodeURIComponent(id):'')+(requestedProfile?'&profile='+encodeURIComponent(requestedProfile):''),{method,cache:'no-store',headers:{Authorization:'Bearer '+s.data.session.access_token,...(method==='POST'?{'Content-Type':'application/json'}:{})},...(method==='POST'?{body:JSON.stringify({...body,...(requestedProfile?{profile:requestedProfile}:{})})}:{})});
   const result=await response.json(),latest=await client.auth.getSession();if(!current||latest.error||latest.data?.session?.user?.id!==account){invalidate();throw Error('Sua sessão mudou.');}
   if(response.status===401){invalidate();throw Error('Entre novamente.');}if(!response.ok)throw Error(result.error||'Não foi possível concluir.');return result;
  }
  controller=mountTrainings(root,{api,isCurrent:()=>current,uploadAsset:async(ticket,file)=>{if(!current)throw Error('Sessão alterada.');const result=await client.storage.from(ticket.bucket).uploadToSignedUrl(ticket.path,ticket.token,file,{contentType:ticket.contentType});if(result.error)throw Error('Falha no envio. O material permanece em rascunho; confira o gerenciador.');},download:(id,text)=>{const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=id+'-atividade.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}});
 }catch(e){root.textContent=e.message;}
}
start();
