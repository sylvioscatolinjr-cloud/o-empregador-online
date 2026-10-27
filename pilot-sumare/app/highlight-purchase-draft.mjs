// Draft only: intentionally not wired to the production app yet.
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=cents=>(cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const date=value=>value?new Date(value).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}):'—';
const labels={creating:'Preparando',pending:'Pagamento pendente',confirmed:'Pagamento confirmado',expired:'Checkout expirado',canceled:'Cancelada ou pagamento revertido',failed:'Não concluída',review:'Em verificação'};
function checkoutUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='asaas.com'&&u.pathname==='/checkoutSession/show'?u.href:null;}catch{return null;}}
export function mountHighlightPurchase(root,{api,isCurrent=()=>root.isConnected,navigate=url=>location.assign(url)}={}){
 let data=null,busy=false;
 async function show(){
  root.innerHTML='<h1>Destacar minha publicação</h1><p>Carregando…</p>';
  try{const result=await api('highlights');if(!isCurrent())return;data=result;render();}
  catch(error){if(isCurrent())root.innerHTML='<h1>Destacar minha publicação</h1><p role="alert">'+escapeHtml(error.message)+'</p><a class="portal-action" href="/conta.html">Voltar à conta</a>';}
 }
 function render(){
  const options=data.items.map(x=>`<option value="${escapeHtml(x.id)}">${escapeHtml(x.title)} — ${escapeHtml({candidate:'Currículo',job:'Vaga',course:'Curso',training:'Treinamento'}[x.kind])}</option>`).join('');
  const orders=data.orders.map(o=>{const url=o.status==='pending'?checkoutUrl(o.url):null;return `<article class="panel"><p>${escapeHtml(labels[o.status]||o.status)} · ${o.days} dias · ${money(o.cents)}</p>${o.starts_at?`<p>Início: ${escapeHtml(date(o.starts_at))}<br>Fim: ${escapeHtml(date(o.ends_at))}</p>`:''}<div class="actions">${url?`<a class="portal-action" href="${escapeHtml(url)}">Continuar pagamento no Asaas</a>`:''}${o.checkout_id?`<button type="button" data-sync="${escapeHtml(o.id)}">Conferir pagamento</button>`:''}</div></article>`;}).join('')||'<p>Nenhuma campanha contratada.</p>';
  root.innerHTML=`<h1>Destacar minha publicação</h1><p>Escolha uma publicação e o período. O valor é pago uma vez e o destaque começa após a confirmação do pagamento. Não há renovação automática.</p><p>Plano vigente: nível ${Number(data.tier)||0}. Os destaques dividem as posições disponíveis; não há promessa de contratação, matrícula ou primeiro lugar permanente.</p><p>${data.ready?'':'Destaques pagos ainda não estão disponíveis.'}</p><form data-highlight-form><label>Item<select name="target" required><option value="">Selecione um item</option>${options}</select></label><label>Período<select name="days"><option value="7">7 dias</option><option value="15">15 dias</option><option value="30">30 dias</option></select></label><p data-quote>Selecione um item para ver o valor.</p><label>Confirme a senha da sua conta<input type="password" name="password" autocomplete="current-password" required></label><label><input type="checkbox" name="accept" required> Li o valor e autorizo esta compra avulsa. A ativação depende da confirmação do pagamento.</label><button type="submit" class="primary" ${!data.ready||!data.items.length?'disabled':''}>Comprar destaque no Asaas</button><p role="status" aria-live="polite" data-status></p></form><h2>Minhas campanhas</h2>${orders}<div class="actions"><a class="portal-action" href="/conta.html">Voltar à conta</a></div>`;
  const form=root.querySelector('[data-highlight-form]'),status=root.querySelector('[data-status]');
  function choice(){const item=data.items.find(x=>x.id===form.querySelector('[name=target]').value);const days=Number(form.querySelector('[name=days]').value);const quote=item&&data.prices[item.kind]?.find(q=>q.days===days);return {item,quote};}
  function changed(){form.querySelector('[name=accept]').checked=false;const {item,quote}=choice();root.querySelector('[data-quote]').textContent=item&&quote?`${quote.days} dias: ${money(quote.cents)} · preço base ${money(quote.baseCents)} · desconto ${quote.discountPercent}%.`:'Selecione um item para ver o valor.';}
  form.querySelector('[name=target]').addEventListener('change',changed);form.querySelector('[name=days]').addEventListener('change',changed);
  form.addEventListener('submit',async event=>{event.preventDefault();if(busy||!data.ready)return;const {item,quote}=choice(),password=form.querySelector('[name=password]').value;if(!item||!quote||!password||!form.querySelector('[name=accept]').checked){status.textContent='Selecione um item, confira o valor, confirme sua senha e aceite as condições.';return;}
   busy=true;form.querySelector('button[type=submit]').disabled=true;status.textContent='Preparando o checkout…';
   try{const response=await api('highlight-checkout','POST',{targetId:item.id,kind:item.kind,days:quote.days,tier:quote.tier,cents:quote.cents,termsVersion:data.termsVersion,password,accept:true});form.querySelector('[name=password]').value='';if(!isCurrent())return;const url=checkoutUrl(response.url);if(!url)throw Error('Checkout indisponível. Confira o histórico antes de tentar novamente.');navigate(url);}
   catch(error){form.querySelector('[name=password]').value='';if(isCurrent())status.textContent=error.message||'Confira o histórico antes de tentar novamente.';}
   finally{busy=false;if(isCurrent())form.querySelector('button[type=submit]').disabled=!data.ready;}
  });
  for(const button of root.querySelectorAll('[data-sync]'))button.addEventListener('click',async()=>{if(busy)return;busy=true;button.disabled=true;try{const response=await api('highlight-sync','POST',{id:button.dataset.sync});if(!isCurrent())return;data=await api('highlights');if(!isCurrent())return;render();root.querySelector('[data-status]').textContent=response.message;}catch(error){if(isCurrent())root.querySelector('[data-status]').textContent=error.message;}finally{busy=false;if(isCurrent()&&button.isConnected)button.disabled=false;}});
 }
 return {show};
}
