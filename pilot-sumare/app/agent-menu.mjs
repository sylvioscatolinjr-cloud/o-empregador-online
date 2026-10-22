import {taskHelpMarkup,attachTaskHelp} from './task-help.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function attachAgentMenu(menu,{client,revision,navigate}){
 const toggle=menu.querySelector('[data-agent-toggle]'),items=menu.querySelector('[data-agent-items]');if(!toggle||!items)return;
 let loading=false;
 toggle.addEventListener('click',async()=>{
  if(loading)return;const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));items.hidden=!open;if(!open)return;
  loading=true;toggle.disabled=true;items.textContent='Conferindo recursos do seu plano…';const rev=revision();
  try{const session=await client.auth.getSession(),user=session.data?.session?.user?.id;if(session.error||!user)throw Error();const r=await fetch('/api/ai?action=catalog',{cache:'no-store',headers:{Authorization:'Bearer '+session.data.session.access_token}}),catalog=await r.json();const current=await client.auth.getSession();if(!menu.isConnected||revision()!==rev||current.error||current.data?.session?.user?.id!==user)return;if(!r.ok||!Array.isArray(catalog.tasks))throw Error();
   items.innerHTML=`<p class="ai-resource-count">${catalog.tasks.filter(t=>t.available).length} de ${catalog.tasks.length} recursos liberados pelo seu plano</p>`+catalog.tasks.map((t,i)=>`<div class="ai-resource"><button type="button" class="ai-resource-action" data-agent-choice="${i}">${esc(t.label)}${t.available?'<span class="agent-access">Disponível no seu plano</span>':`<span class="agent-access">🔒 Nível ${Number(t.minTier)} · Ver plano</span>`}</button>${taskHelpMarkup(t,'agent-menu',i)}</div>`).join('');
   attachTaskHelp(items);
   items.querySelectorAll('[data-agent-choice]').forEach(b=>b.addEventListener('click',()=>{const t=catalog.tasks[Number(b.dataset.agentChoice)];if(!t||revision()!==rev)return;navigate(t.available?'/assistente.html?tarefa='+encodeURIComponent(t.id):'/assinatura.html?recurso='+encodeURIComponent(t.id)+'&nivel='+t.minTier);}));
  }catch{if(menu.isConnected&&revision()===rev)items.textContent='Não foi possível conferir seu plano. Feche e abra Meus agentes para tentar novamente.';}
  finally{loading=false;if(menu.isConnected)toggle.disabled=false;}
 });
}
