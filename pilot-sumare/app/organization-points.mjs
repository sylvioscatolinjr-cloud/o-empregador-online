const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=v=>Number(v).toLocaleString('pt-BR',{maximumFractionDigits:2});
const format=p=>p?.average===null||p?.average===undefined?'Sem média':number(p.average);
function variation(row){
 if(row.previous_members===null||row.previous_members===undefined)return 'Primeiro registro';
 if(row.average===null)return row.previous_average===null?'Sem média':'Média indisponível';
 if(row.previous_average===null)return 'Média disponível';
 const change=Number(row.average)-Number(row.previous_average);
 return change>0?'↑ Subiu '+number(change)+' ponto(s)':change<0?'↓ Caiu '+number(-change)+' ponto(s)':'— Média mantida';
}
function historyMarkup(history,department=null){
 const rows=(history||[]).filter(r=>(r.department_id??null)===department);
 if(!rows.length)return '';
 return `<p><strong>${variation(rows[0])}</strong>${rows[0].previous_members===null?'.':' em relação ao registro anterior.'}</p><details><summary>Histórico das médias — ${department===null?'organização':'departamento'}</summary><div class="table-scroll" role="region" aria-label="Histórico das médias" tabindex="0"><table><caption>Últimas ${rows.length} medições com alteração</caption><thead><tr><th scope="col">Data e hora (Brasília)</th><th scope="col">Média anterior</th><th scope="col">Média atual</th><th scope="col">Variação</th><th scope="col">Integrantes antes → agora</th></tr></thead><tbody>${rows.map(r=>{const date=new Date(r.recorded_at),label=Number.isNaN(date.getTime())?'Data indisponível':date.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});return `<tr><td>${esc(label)}</td><td>${r.previous_members===null||r.previous_members===undefined?'Primeiro registro':format({average:r.previous_average})}</td><td>${format(r)}</td><td>${variation(r)}</td><td>${r.previous_members===null||r.previous_members===undefined?'—':Number(r.previous_members)} → ${Number(r.members)}</td></tr>`;}).join('')}</tbody></table></div></details>`;
}
export function organizationPointsMarkup(data){
 if(data.unavailable)return '<section class="panel"><h2>Pontuação profissional da equipe</h2><p>Consulta temporariamente indisponível. Atualize a página para conferir; vínculos e pontos salvos foram preservados.</p></section>';
 return `<section class="panel"><h2>Pontuação profissional da equipe</h2><p>Média da organização: <strong>${format(data.organization)}</strong> · ${Number(data.organization?.members||0)} integrante(s) no cálculo.</p>${historyMarkup(data.history)}<p>Somente vínculos aceitos, contas ativas e cartões públicos autorizados. Cada pessoa conta uma vez na organização; integrantes sem formação validada contam com zero. Pontos pessoais, intelectuais e espirituais ficam fora.</p>${data.departments.map(d=>`<div><p><strong>${esc(d.name)}</strong>: ${format(d.points)} · ${Number(d.points.members)} integrante(s)</p>${historyMarkup(data.history,d.id)}</div>`).join('')}<p>As médias são recalculadas ao consultar. Encerrar um vínculo ou retirar a autorização pública remove a participação no cálculo.</p><p>O histórico registra mudanças ao abrir esta tela, a partir do primeiro acesso. Alterações entre duas consultas aparecem juntas; a data indica a medição e não a data de contratação ou desligamento. A variação pode refletir vínculos, formações validadas, validade dos bônus ou autorização pública. São mantidas até 100 medições alteradas por organização e por setor; as últimas 20 são exibidas. Não há substituição automática de pessoas.</p></section>`;
}
