import {createClient} from '@supabase/supabase-js';
const mount=document.querySelector('#ai-app');
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let client,accountId,previewLogin=false,authRevision=0;
function invalidateSession(){
 authRevision++;accountId=null;
 if(previewLogin)signInForm();
 else mount.textContent='Sua sessão mudou ou expirou. Entre novamente na sua conta.';
}
async function api(path,method='GET',payload){
 const expectedId=accountId,revision=authRevision;
 const {data,error}=await client.auth.getSession();
 if(error||!expectedId||!data.session||data.session.user?.id!==expectedId){if(accountId===expectedId)invalidateSession();throw Error('Entre novamente na sua conta.');}
 const response=await fetch('/api/ai?action='+encodeURIComponent(path.replace(/^ai-/,'').replace('agent-catalog','catalog')),{method,cache:'no-store',headers:{Authorization:'Bearer '+data.session.access_token,...(payload?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{})});
 const result=await response.json();
 const current=await client.auth.getSession();
 if(revision!==authRevision||current.error||current.data?.session?.user?.id!==expectedId){if(accountId===expectedId)invalidateSession();throw Error('Entre novamente na sua conta.');}
 if(!response.ok)throw Error(result.error||'Serviço indisponível.');
 return result;
}
function signInForm(){
 mount.innerHTML='<h1>Homologação dos agentes de IA</h1><p>Entrada restrita às contas de teste já preparadas. Cadastro e recuperação por e-mail ainda não estão disponíveis neste ambiente.</p><form id="ai-login"><label for="ai-email">E-mail da conta de teste</label><input id="ai-email" name="email" type="email" autocomplete="username" required><label for="ai-password">Senha</label><input id="ai-password" name="password" type="password" autocomplete="current-password" required><button type="submit">Entrar</button><p id="ai-login-status" role="status" aria-live="polite"></p></form>';
 const form=mount.querySelector('form'),status=mount.querySelector('#ai-login-status');let busy=false;
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;busy=true;form.querySelector('button').disabled=true;status.textContent='Conferindo acesso…';
  try{
   const {error}=await client.auth.signInWithPassword({email:form.querySelector('[name="email"]').value.trim(),password:form.querySelector('[name="password"]').value});
   form.querySelector('[name="password"]').value='';
   if(error)throw Error('Não foi possível entrar. Confira os dados da conta de teste.');
   await showAgent();
  }catch(error){status.textContent=error.message;busy=false;form.querySelector('button').disabled=false;}
 });
}
async function showAgent(){
 const {data,error}=await client.auth.getSession();
 if(error||!data.session){if(previewLogin){signInForm();return;}throw Error('Faça login na sua conta antes de usar o assistente.');}
 accountId=data.session.user.id;
 const [catalog,initialBalance]=await Promise.all([api('agent-catalog'),api('ai-balance')]);
 mount.innerHTML=`${previewLogin?'<p role="note">Homologação restrita · Use somente informações fictícias.</p>':''}<h1>${escapeHTML(catalog.agent?.title||'Assistente de IA')}</h1><p>${escapeHTML(catalog.agent?.mission||'')}</p><p id="ai-status" role="status" aria-live="polite"></p><form id="ai-form"><label for="ai-question">Como posso ajudar?</label><textarea id="ai-question" name="question" maxlength="4000" required rows="5" placeholder="Escreva sua pergunta aqui"></textarea><button type="submit" disabled>Enviar pergunta (1 crédito)</button></form><section id="ai-answer" aria-live="polite" style="white-space:pre-wrap;overflow-wrap:anywhere"></section>${previewLogin?'<button id="ai-signout" type="button">Sair da conta de teste</button>':'<p><a href="/assinatura.html">Conhecer os planos</a></p>'}`;
 const form=mount.querySelector('#ai-form'),status=mount.querySelector('#ai-status'),answer=mount.querySelector('#ai-answer'),button=form.querySelector('button');
 let balance=initialBalance,busy=false;
 const update=()=>{button.disabled=busy||!balance.active||balance.availableCalls<1;};
 status.textContent=`${balance.active?'':'Conversas em preparação. '}Créditos disponíveis: ${balance.availableCalls??0} chamadas completas.`;update();
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||!balance.active||balance.availableCalls<1)return;
  const question=form.querySelector('[name="question"]').value;if(!question.trim())return;
  busy=true;update();status.textContent='Consultando o assistente…';let completed=false;
  try{const response=await api('ai-chat','POST',{question});if(!mount.contains(form))return;answer.textContent=response.answer;completed=true;status.textContent='Resposta concluída.';}
  catch(error){if(!mount.contains(form))return;status.textContent=error.message;}
  try{balance=await api('ai-balance');if(completed)status.textContent=`Resposta concluída. Saldo: ${balance.availableCalls} chamadas completas.`;}
  catch{balance={active:false,availableCalls:0};status.textContent+=' Não foi possível atualizar o saldo. Recarregue a página antes de enviar outra pergunta.';}
  busy=false;update();
 });
 const signout=mount.querySelector('#ai-signout');
 if(signout)signout.addEventListener('click',async()=>{
  if(busy)return;signout.disabled=true;
  try{const {error}=await client.auth.signOut();if(error)throw error;accountId=null;signInForm();}
  catch{status.textContent='A saída não foi confirmada. Tente novamente.';signout.disabled=false;}
 });
}
async function load(){
 try{
  const cfgResponse=await fetch('/api/config',{cache:'no-store'});
  if(!cfgResponse.ok)throw Error('O serviço de autenticação está indisponível.');
  const config=await cfgResponse.json();previewLogin=!config.ready&&!!config.aiPreview;
  const cfg=config.ready?config:config.aiPreview;
  if(!cfg||cfg.origin!==location.origin)throw Error(config.message||'Abra o portal oficial para acessar os agentes.');
  client=createClient(cfg.supabaseURL,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  client.auth.onAuthStateChange?.((_event,session)=>{
   if(accountId&&session?.user?.id!==accountId)invalidateSession();
  });
  await showAgent();
 }catch(error){mount.textContent=error.message;}
}
load();
