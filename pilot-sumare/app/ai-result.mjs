import {externalSearchCost,safeSourceURL} from '../src/ai-external-search.mjs';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const taskCostLabel=(task,owner=false,mode=null)=>owner?'Teste — sem débito':task?.mode==='publication'?'Imagem R$ 2,50 / R$ 5,00 · Texto R$ 1,00':task?.mode==='external_search'&&!mode?'Padrão R$ 2,50 / Ampliada R$ 5,00':(((task?.mode==='external_search'?externalSearchCost(mode):task?.costCents)??100)/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}).replace(/\u00a0/g,' ')+' em créditos';
export function searchResultMarkup(result){
 const text=String(result.answer||'');let prepared='',cursor=0;const links=[];
 const refs=(result.citations||[]).filter(c=>safeSourceURL(c.url)&&Number.isInteger(c.start)&&Number.isInteger(c.end)&&c.start>=0&&c.end<=text.length&&c.end>c.start).sort((a,b)=>a.start-b.start);
 // Insert opaque references before formatting so source offsets remain accurate.
 let marker='OEO_SOURCE_';while(text.includes(marker))marker+='X';
 for(const c of refs){if(c.start<cursor)continue;prepared+=text.slice(cursor,c.start)+marker+links.length+'_END';links.push(c);cursor=c.end;}
 prepared+=text.slice(cursor);
 let html=researchTextMarkup(prepared);
 links.forEach((c,i)=>{html=html.replace(marker+i+'_END',sourceLink(c.url,'Fonte '+(i+1),c.title));});
 const sources=[...new Map(refs.map(c=>[c.url,c])).values()];
 const date=new Date(result.searchedAt);const consulted=Number.isNaN(date.getTime())?'Data não informada':date.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});
 return `<div class="research-result"><p class="research-date">Consulta: ${esc(consulted)}. Confirme disponibilidade e condições na fonte.</p>${html}<h3>Fontes da pesquisa</h3><ul>${sources.map(c=>`<li>${sourceLink(c.url,c.title||new URL(c.url).hostname)}</li>`).join('')}</ul></div>`;
}
function sourceLink(url,label,title=''){
 const safe=safeSourceURL(url);return safe?`<a href="${esc(safe)}" target="_blank" rel="noopener noreferrer"${title?` aria-label="Fonte: ${esc(title)}"`:''}>${esc(label)}</a>`:esc(label);
}
function inlineText(text){
 // Only this small allowlist becomes HTML. Provider HTML always remains text.
 const tokens=/\[([^\]\n]+)\]\(([^\s)]+)\)|\*\*([^*\n]+)\*\*|`([^`\n]+)`|(https:\/\/[^\s<>"']+)/g;
 let out='',cursor=0;for(const m of text.matchAll(tokens)){out+=esc(text.slice(cursor,m.index));
  if(m[5]!==undefined){const url=m[5].replace(/[.,;!?)]*$/,'');const safe=safeSourceURL(url);out+=safe?sourceLink(safe,'Abrir anúncio · '+new URL(safe).hostname)+esc(m[5].slice(url.length)):esc(m[5]);}
  else out+=m[1]!==undefined?sourceLink(m[2],m[1]):m[3]!==undefined?'<strong>'+esc(m[3])+'</strong>':'<code>'+esc(m[4])+'</code>';
  cursor=m.index+m[0].length;
 }return out+esc(text.slice(cursor));
}
export function researchTextMarkup(text){
 const lines=String(text||'').replace(/\r\n?/g,'\n').split('\n');let html='',list=false,card=false;
 const closeList=()=>{if(list){html+='</ul>';list=false;}};
 for(const raw of lines){const line=raw.trim();if(!line){closeList();continue;}
  const numbered=/^(\d+)[.)]\s+(.+)$/.exec(line.startsWith('**')&&line.endsWith('**')?line.slice(2,-2):line);
  if(numbered){closeList();if(card)html+='</article>';html+='<article class="research-opportunity"><h3>'+inlineText(numbered[1]+'. '+numbered[2])+'</h3>';card=true;continue;}
  const heading=/^#{1,6}\s+(.+)$/.exec(line);
  if(heading){closeList();html+='<h4>'+inlineText(heading[1])+'</h4>';continue;}
  const bullet=/^[-*]\s+(.+)$/.exec(line);
  if(bullet){if(!list){html+='<ul>';list=true;}html+='<li>'+inlineText(bullet[1])+'</li>';continue;}
  closeList();html+='<p>'+inlineText(line)+'</p>';
 }
 closeList();if(card)html+='</article>';return html;
}
export function searchHistoryAnswer(result){let text=result.answer+'\n\nConsulta: '+result.searchedAt+'\nFontes:\n';for(const c of new Map((result.citations||[]).map(c=>[c.url,c])).values()){const line=c.title+': '+c.url+'\n';if(text.length+line.length>19800){text+='[Demais fontes disponíveis no resultado original.]';break;}text+=line;}return text;}

