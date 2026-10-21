import {createClient} from '@supabase/supabase-js';
const mount=document.querySelector('#ai-app');
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let client,accountId;
async function api(path,method='GET',payload){
 const {data,error}=await client.auth.getSession();
 if(error||!data.session||data.session.user?.id!==accountId)throw Error('Entre novamente na sua conta.');
 const response=await fetch('/api/'+path,{method,cache:'no-store',headers:{Authorization:'Bearer '+data.session.access_token,...(payload?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{})});
 const result=await response.json();
 if(!response.ok)throw Error(result.error||'Serviço indisponível.');
 return result;
}
async function load(){
 try{
  const cfgResponse=await fetch('/api/config',{cache:'no-store'});
  if(!cfgResponse.ok)throw Error('O serviço de autenticação está indisponível.');
  const cfg=await cfgResponse.json();
  if(!cfg.ready||cfg.origin!==location.origin)throw Error('Abra o portal oficial para acessar os agentes.');
  client=createClient(cfg.supabaseURL,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  const {data,error}=await client.auth.getSession();
  if(error||!data.session)throw Error('Faça login na sua conta antes de usar o assistente.');
  accountId=data.session.user.id;
  const [catalog,balance]=await Promise.all([api('agent-catalog'),api('ai-balance')]);
  mount.innerHTML=`<h1>${escapeHTML(catalog.agent?.title||'Assistente de IA')}</h1><p>${escapeHTML(catalog.agent?.mission||'')}</p><p id="ai-status" role="status" aria-live="polite">${balance.active?'': 'Conversas em preparação. A função será liberada após homologação.'} Créditos disponíveis: ${balance.availableCalls??0} chamadas completas.</p><form id="ai-form"><label for="ai-question">Como posso ajudar?</label><textarea id="ai-question" name="question" maxlength="4000" required rows="5" placeholder="Escreva sua pergunta aqui"></textarea><button type="submit" ${balance.active&&balance.availableCalls>0?'':'disabled'}>Enviar pergunta (1 crédito)</button></form><section id="ai-answer" aria-live="polite"></section><p><a href="/assinatura.html">Conhecer os planos</a></p>`;
  const form=mount.querySelector('#ai-form'),status=mount.querySelector('#ai-status'),answer=mount.querySelector('#ai-answer');
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   const question=form.question?.value||form.querySelector('[name="question"]').value;
   if(!question.trim())return;
   const button=form.querySelector('button');button.disabled=true;status.textContent='Consultando o assistente…';
   try{
    const response=await api('ai-chat','POST',{question});
    answer.textContent=response.answer;
    const latest=await api('ai-balance');
    status.textContent=`Resposta concluída. Saldo: ${latest.availableCalls} chamadas completas.`;
    button.disabled=!latest.active||latest.availableCalls<1;
   }catch(error){status.textContent=error.message;button.disabled=!balance.active;}
  });
 }catch(error){mount.textContent=error.message;}
}
load();
