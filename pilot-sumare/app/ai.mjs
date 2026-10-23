import {taskHelpMarkup,attachTaskHelp} from './task-help.mjs';
import {mountAgentHistory} from './ai-history.mjs';
import {mountResumeReview} from './ai-resume.mjs';
import {createClient} from '@supabase/supabase-js';
const mount=document.querySelector('#ai-app');
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let client,accountId,previewLogin=false,authRevision=0;
const requestedProfile=new URLSearchParams(location.search||'').get('perfil');
function invalidateSession(){
 authRevision++;accountId=null;
 if(previewLogin)signInForm();
 else mount.textContent='Sua sessão mudou ou expirou. Entre novamente na sua conta.';
}
async function api(path,method='GET',payload){
 const expectedId=accountId,revision=authRevision;
 const {data,error}=await client.auth.getSession();
 if(error||!expectedId||!data.session||data.session.user?.id!==expectedId){if(accountId===expectedId)invalidateSession();throw Error('Entre novamente na sua conta.');}
 const response=await fetch('/api/ai?action='+encodeURIComponent(path.replace(/^ai-/,'').replace('agent-catalog','catalog'))+(requestedProfile?'&profile='+encodeURIComponent(requestedProfile):''),{method,cache:'no-store',headers:{Authorization:'Bearer '+data.session.access_token,...(payload?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify({...payload,...(requestedProfile?{profile:requestedProfile}:{})})}:{})});
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
 const ownerMode=catalog.ownerTesting===true,costLabel=ownerMode?'Teste — sem débito':'R$ 1,00 em créditos';
 const profileLinks=ownerMode?'<p class=hint>Modo proprietário: todos os níveis liberados. Até 60 tentativas por dia, compartilhadas entre os perfis. A API da OpenAI tem custo real para o portal. Sua assinatura e carteira permanecem iguais.</p><div class="actions owner-profile-actions">'+Object.entries({learner:'Candidato',recruiter:'Empresa',school_staff:'Instituição'}).map(([r,label])=>`<a class=portal-action href="/assistente.html?perfil=${r}" ${r===catalog.profileRole?'aria-current=page':''}>Testar ${label}</a>`).join('')+'</div>':'';
 mount.innerHTML=`${previewLogin?'<p role="note">Homologação restrita · Use somente informações fictícias.</p>':''}<h1>Meus agentes</h1>${profileLinks}<h2>${escapeHTML(catalog.agent?.title||'Assistente de IA')}</h2><p>${escapeHTML(catalog.agent?.mission||'')}</p><p id="ai-status" role="status" aria-live="polite"></p><p>${ownerMode?'Acesso de teste: todos os níveis.':'Seu plano: nível '+(Number.isInteger(catalog.tier)?catalog.tier:0)+'.'} <a href="/assinatura.html">Ver planos</a></p><div class="actions"><a class="portal-action" href="/carteira.html">Comprar créditos de IA</a></div><p>Escolha uma tarefa ou o Agente livre. ${ownerMode?'Seu modo de teste usa o limite diário, sem débito na carteira.':'Cada nova solicitação confirmada custa R$ 1,00 em créditos, independentemente do plano.'} A revisão de currículo usa os dados salvos da sua conta. Nas demais tarefas, informe o texto necessário.</p><p class="ai-resource-count">${(catalog.tasks||[]).filter(t=>t.available).length} de ${(catalog.tasks||[]).length} recursos liberados ${ownerMode?'para teste do proprietário':'para seu perfil'}</p><nav aria-label="Tarefas do agente" id="ai-tasks">${(catalog.tasks||[]).map((t,i)=>`<div class="ai-resource"><button type="button" class="ai-resource-action" data-task="${escapeHTML(t.id)}" aria-pressed="false">${escapeHTML(t.label)} · ${t.available?costLabel:'🔒 Plano nível '+t.minTier+' · Ver plano'}<span data-task-selected aria-hidden="true" hidden>✓</span></button>${taskHelpMarkup(t,'ai-task',i)}</div>`).join('')}</nav><p id="ai-task-help">Selecione uma tarefa. Todos os recursos do seu perfil estão disponíveis.</p><p>O texto será enviado à OpenAI para gerar a orientação. Remova CPF, contatos e dados sensíveis. Não informe dados de outras pessoas. A resposta só é salva no histórico privado quando você escolher salvar. Revise o texto antes de guardar; não inclua dados de outras pessoas.</p><p id="ai-selection" class="hint" role="status" aria-live="polite">Nenhum recurso selecionado. Escolha uma opção acima. Selecionar não consome créditos.</p><section id="ai-resume-review" hidden></section><form id="ai-form"><label for="ai-question">Informações para a tarefa</label><textarea id="ai-question" name="question" maxlength="4000" required rows="5" placeholder="Escreva sua pergunta aqui"></textarea><button type="submit" disabled>Confirmar e executar — ${costLabel}</button></form><section id="ai-answer" aria-live="polite" style="white-space:pre-wrap;overflow-wrap:anywhere"></section><button type="button" id="ai-save-note" hidden>Salvar esta orientação no histórico privado</button><section id="ai-history"></section>${previewLogin?'<button id="ai-signout" type="button">Sair da conta de teste</button>':'<p><a href="/assinatura.html">Conhecer os planos</a></p>'}`;
 const form=mount.querySelector('#ai-form'),status=mount.querySelector('#ai-status'),answer=mount.querySelector('#ai-answer'),button=form.querySelector('button');
 let balance=initialBalance,busy=false,selectedTask=null,lastResult=null;
 const saveNote=mount.querySelector('#ai-save-note');
 const history=mountAgentHistory(mount.querySelector('#ai-history'),{api,isCurrent:()=>mount.contains(form),onReuse:(note,text)=>{if(busy)return;const chosen=taskButtons.find(b=>b.dataset.task===note.task_id);if(!chosen)return;chosen.click();if(selectedTask?.id!==note.task_id)return;form.querySelector('[name="question"]').value=text;status.textContent='Orientação retomada. Informe seu progresso e revise o texto antes de executar. Nada foi cobrado.';}});
 saveNote.addEventListener('click',async()=>{if(busy||!lastResult||saveNote.hidden)return;busy=true;saveNote.disabled=true;update();try{await api('history-save','POST',{...lastResult,consent:true});if(!mount.contains(form))return;saveNote.hidden=true;status.textContent='Orientação salva no histórico privado. Nenhum crédito consumido pelo salvamento.';await history.refresh();}catch(error){if(mount.contains(form))status.textContent=error.message;}finally{busy=false;saveNote.disabled=false;update();}});

 attachTaskHelp(mount);
 const taskButtons=[...mount.querySelectorAll('[data-task]')];
 const resumeRoot=mount.querySelector('#ai-resume-review');
 mountResumeReview(resumeRoot,{api,isCurrent:()=>mount.contains(form),onBusy:value=>{busy=value;update();},onBalance:async()=>{try{balance=await api('ai-balance');status.textContent=(ownerMode?'Testes disponíveis hoje: ':'Saldo: ')+balance.availableCalls+' chamadas completas.';}catch{balance={active:false,availableCalls:0};status.textContent='Não foi possível confirmar o saldo. Recarregue antes de executar outra análise.';}update();}});
 for(const taskButton of taskButtons)taskButton.addEventListener('click',()=>{if(busy)return;const chosen=(catalog.tasks||[]).find(t=>t.id===taskButton.dataset.task);if(chosen&&!chosen.available){location.assign('/assinatura.html?recurso='+encodeURIComponent(chosen.id)+'&nivel='+chosen.minTier);return;}selectedTask=(catalog.tasks||[]).find(t=>t.id===taskButton.dataset.task&&t.available);if(!selectedTask)return;for(const b of taskButtons){b.setAttribute('aria-pressed',String(b===taskButton));b.querySelector('[data-task-selected]').hidden=b!==taskButton;}mount.querySelector('#ai-selection').textContent='Recurso selecionado: '+selectedTask.label+'. '+costLabel+'. A seleção não realiza cobrança.';mount.querySelector('#ai-task-help').textContent=selectedTask.label+': '+selectedTask.hint+' '+costLabel+'.';answer.textContent='';lastResult=null;saveNote.hidden=true;form.querySelector('[name="question"]').placeholder=selectedTask.hint;const resume=selectedTask.id==='resume_review';form.hidden=resume;resumeRoot.hidden=!resume;update();});
 const update=()=>{button.disabled=!selectedTask||busy||!balance.active;for(const b of taskButtons)b.disabled=busy;button.disabled=button.disabled||balance.availableCalls<1;};
 status.textContent=`${balance.active?'':'Conversas em preparação. '}${ownerMode?'Testes disponíveis hoje':'Créditos disponíveis'}: ${balance.availableCalls??0} chamadas completas.`;update();
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!selectedTask||busy||!balance.active||balance.availableCalls<1)return;
  const question=form.querySelector('[name="question"]').value;if(!question.trim())return;
  busy=true;update();status.textContent='Consultando o assistente…';let completed=false;
  try{const response=await api('ai-chat','POST',{question,taskId:selectedTask.id});if(!mount.contains(form))return;answer.textContent=response.answer;lastResult={taskId:selectedTask.id,question,answer:response.answer};saveNote.hidden=false;completed=true;status.textContent='Resposta concluída.';}
  catch(error){if(!mount.contains(form))return;status.textContent=error.message;}
  try{balance=await api('ai-balance');if(completed)status.textContent=`Resposta concluída. ${ownerMode?'Testes restantes hoje':'Saldo'}: ${balance.availableCalls} chamadas completas.`;}
  catch{balance={active:false,availableCalls:0};status.textContent+=' Não foi possível atualizar o saldo. Recarregue a página antes de enviar outra pergunta.';}
  busy=false;update();
 });
 void history.refresh();
 const requested=new URLSearchParams(location.search||'').get('tarefa');const requestedButton=taskButtons.find(b=>b.dataset.task===requested);if(requestedButton)requestedButton.click();
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
