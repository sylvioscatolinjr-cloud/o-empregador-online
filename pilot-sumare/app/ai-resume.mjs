const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountResumeReview(root,{api,isCurrent,onBalance,onBusy}){
 let source=null,attachmentText='',proposal=null,busy=false;
 root.innerHTML='<h3>Revisar o currículo salvo</h3><p>Carregue os campos preenchidos e o anexo privado da sua conta. Nenhuma alteração será salva durante a análise.</p><button type="button" data-resume-ai="load">Carregar meu currículo e anexo</button><p data-review-status role="status"></p><div data-review-source></div><div data-review-results></div>';
 const status=root.querySelector('[data-review-status]'),sources=root.querySelector('[data-review-source]'),results=root.querySelector('[data-review-results]');
 const current=()=>root.isConnected&&isCurrent();
 const lock=value=>{busy=value;onBusy(value);for(const button of root.querySelectorAll('button'))button.disabled=value;};
 root.addEventListener('click',async event=>{
  const action=event.target.closest('[data-resume-ai]')?.dataset.resumeAi;if(!action||busy||!current())return;
  if(action==='discard'){proposal=null;results.innerHTML='';status.textContent='Original mantido. Nenhuma sugestão foi salva.';return;}
  if(action==='analyze'&&(!source||!root.querySelector('[data-review-consent]')?.checked)){status.textContent='Confirme o envio dos textos à OpenAI antes de analisar.';return;}
  lock(true);
  try{
   if(action==='load'){
    source=null;proposal=null;attachmentText='';sources.innerHTML='';results.innerHTML='';status.textContent='Carregando os dados salvos…';
    const loaded=await api('resume-source');if(!current())return;
    if(loaded.attachment){status.textContent='Lendo o anexo salvo neste aparelho…';const response=await fetch(loaded.attachment.url,{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw Error('Não foi possível ler o anexo privado. Carregue novamente.');if(Number(response.headers.get('content-length'))>5242880)throw Error('O anexo ultrapassa 5 MB.');const blob=await response.blob();if(blob.size>5242880)throw Error('O anexo ultrapassa 5 MB.');const readers=await import('/import/resume-extractors.mjs');const extracted=await readers.extractResumeText(new File([blob],loaded.attachment.name),{onProgress:message=>{if(current())status.textContent=message;}});if(extracted.text.length>70000)throw Error('O anexo excede o limite de texto desta revisão. Reduza o documento no currículo e tente novamente.');attachmentText=extracted.text;}
    if(!current())return;source=loaded;
    sources.innerHTML=`<details><summary>Campos salvos que serão analisados</summary>${loaded.targets.map(t=>`<h4>${esc(t.label)}</h4><p style="white-space:pre-wrap">${esc(t.value||'(sem texto)')}</p>${t.facts?`<p>${esc(Object.values(t.facts).filter(Boolean).join(' · '))}</p>`:''}`).join('')}</details>${loaded.attachment?`<details><summary>Texto extraído do anexo salvo</summary><pre style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(attachmentText)}</pre></details>`:''}<p>${loaded.attachment?'Anexo salvo lido com sucesso.':'Sem anexo salvo; a análise usará os campos preenchidos.'}</p><p>A OpenAI receberá os textos profissionais e o texto extraído do anexo. O arquivo e a foto não serão enviados. Contatos e documentos reconhecidos serão omitidos; confira o anexo e evite dados sensíveis. A análise custa R$ 1,00 em créditos; escolher e salvar sugestões não cobra novamente.</p><label><input type="checkbox" data-review-consent> Autorizo o envio desses textos à OpenAI para revisar meu currículo.</label><button type="button" data-resume-ai="analyze">Analisar currículo salvo — R$ 1,00 em créditos</button>`;
    status.textContent='Fontes carregadas. Confirme o envio para analisar.';
   }
   if(action==='analyze'){
    if(!source||!root.querySelector('[data-review-consent]')?.checked)throw Error('Confirme o envio dos textos à OpenAI antes de analisar.');
    proposal=null;results.innerHTML='';status.textContent='Analisando o currículo salvo e o texto do anexo…';
    const review=await api('resume-review','POST',{consent:true,version:source.version,attachmentText});if(!current())return;proposal=review;
    results.innerHTML=`<h3>Compare antes de salvar</h3><p>${esc(review.summary)}</p>${review.changes.map((c,i)=>`<article class="panel"><h4>${esc(c.label)}</h4><label><input type="checkbox" data-review-choice="${i}"> Aceitar esta sugestão</label><h5>Original</h5><p style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(c.before||'(sem texto)')}</p><h5>Sugestão da IA</h5><p style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(c.after)}</p><p>${esc(c.reason)}</p></article>`).join('')}<p>Confira os fatos. A IA pode errar. Campos não selecionados continuam como estão; o anexo original permanece guardado.</p>${review.changes.length?'<button type="button" data-resume-ai="save">Salvar somente sugestões selecionadas</button>':''}<button type="button" data-resume-ai="discard">Manter o original</button>`;
    status.textContent=review.changes.length?'Análise concluída. Selecione o que deseja aceitar.':'Análise concluída, sem mudanças propostas.';
    await onBalance();
   }
   if(action==='save'){
    const selected=[...root.querySelectorAll('[data-review-choice]')].filter(box=>box.checked).map(box=>proposal?.changes[Number(box.dataset.reviewChoice)]?.target);if(!proposal||!selected.length)throw Error('Selecione ao menos uma sugestão ou mantenha o original.');
    const saved=await api('resume-save','POST',{proposal:proposal.proposal,selected});if(!current())return;proposal=null;source=null;attachmentText='';sources.innerHTML='';results.innerHTML='';status.textContent=saved.message;
   }
  }catch(error){if(current())status.textContent=error.message; if(action==='analyze'&&current())await onBalance();}
  finally{if(current())lock(false);}
 });
}
