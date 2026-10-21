const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function continuationText(note){
 const question=String(note.question||''),answer=String(note.answer||'');
 return `Contexto anterior${question.length>600?' (trecho)':''}:\n${question.slice(0,600)}\n\nOrientação anterior${answer.length>2800?' (trecho; consulte o histórico completo)':''}:\n${answer.slice(0,2800)}\n\nMeu progresso e alterações desde então:\n`;
}
export function mountAgentHistory(root,{api,isCurrent,onReuse}){
 let busy=false;
 async function show(){
  if(busy)return;busy=true;root.textContent='Carregando histórico privado…';
  try{
   const {notes=[]}=await api('history-list');if(!isCurrent())return;
   root.innerHTML='<h2>Meu histórico de orientações</h2><p>As 100 orientações salvas mais recentes. São anotações de trabalho, sujeitas à sua revisão. Permanecem privadas até você excluir o registro ou a conta. Consultar, retomar ou excluir não consome créditos; executar uma nova análise consome R$ 1,00.</p><button type="button" data-history-refresh>Atualizar histórico</button><p data-history-status role="status"></p>'+notes.map((n,i)=>`<article class="panel"><details><summary>${esc(n.label)} · ${esc(new Date(n.created_at).toLocaleDateString('pt-BR'))}</summary><h3>Informações usadas</h3><p class="agent-saved-text">${esc(n.question)}</p><h3>Orientação salva</h3><p class="agent-saved-text">${esc(n.answer)}</p></details><button type="button" data-history-reuse="${i}">Retomar esta orientação</button><button type="button" data-history-delete="${i}">Excluir do histórico</button></article>`).join('')+(notes.length?'':'<p>Nenhuma orientação salva.</p>');
   root.querySelector('[data-history-refresh]').addEventListener('click',show);
   for(const b of root.querySelectorAll('[data-history-reuse]'))b.addEventListener('click',()=>{if(!busy&&isCurrent())onReuse(notes[Number(b.dataset.historyReuse)],continuationText(notes[Number(b.dataset.historyReuse)]));});
   for(const b of root.querySelectorAll('[data-history-delete]'))b.addEventListener('click',async()=>{
    if(busy||!isCurrent())return;busy=true;b.disabled=true;
    try{await api('history-delete','POST',{id:notes[Number(b.dataset.historyDelete)].id});if(!isCurrent())return;busy=false;await show();}
    catch(error){if(isCurrent()){root.querySelector('[data-history-status]').textContent=error.message;b.disabled=false;}}
    finally{busy=false;}
   });
  }catch(error){if(isCurrent()){root.innerHTML='<p role="status">'+esc(error.message)+'</p><button type="button">Tentar carregar histórico</button>';root.querySelector('button').addEventListener('click',show);}}
  finally{busy=false;}
 }
 return {refresh:show};
}
