const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const taskCostLabel=(task,owner=false)=>owner?'Teste — sem débito':((task?.costCents??100)/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}).replace(/\u00a0/g,' ')+' em créditos';
export function searchResultMarkup(result){
 const text=String(result.answer||'');let html='',cursor=0;
 const refs=(result.citations||[]).filter(c=>/^https:\/\//.test(c.url)&&Number.isInteger(c.start)&&Number.isInteger(c.end)&&c.start>=0&&c.end<=text.length&&c.end>c.start).sort((a,b)=>a.start-b.start);
 for(const c of refs){if(c.start<cursor)continue;html+=esc(text.slice(cursor,c.start))+`<a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer" aria-label="Fonte: ${esc(c.title)}">${esc(text.slice(c.start,c.end))}</a>`;cursor=c.end;}
 html+=esc(text.slice(cursor));
 const sources=[...new Map(refs.map(c=>[c.url,c])).values()];
 return `<p>Consulta: ${esc(new Date(result.searchedAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}))}. Confirme disponibilidade e condições na fonte.</p><div>${html}</div><h3>Fontes da pesquisa</h3><ul>${sources.map(c=>`<li><a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.title)}</a></li>`).join('')}</ul>`;
}
export function searchHistoryAnswer(result){let text=result.answer+'\n\nConsulta: '+result.searchedAt+'\nFontes:\n';for(const c of new Map((result.citations||[]).map(c=>[c.url,c])).values()){const line=c.title+': '+c.url+'\n';if(text.length+line.length>19800){text+='[Demais fontes disponíveis no resultado original.]';break;}text+=line;}return text;}
