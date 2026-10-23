import {quotePlan,cycles} from '../src/billing-plans.mjs';
import {getGuidedTasks} from '../src/ai-agent-catalog.mjs';
const money=v=>(v/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function planOptionsMarkup({profile,requiredTier,currentTier=0}){
 const role={'Candidato':'learner','Empresa':'recruiter','Instituição de Ensino':'school_staff'}[profile];
 if(!role)throw Error('Perfil inválido para consultar planos.');
 const selected=requiredTier||currentTier||1;
 return `<section aria-label="Escolher plano"><h2>Escolha seu plano</h2><p>Compare os níveis para ${esc(profile)}. Selecionar uma opção apenas atualiza a simulação; não altera sua assinatura nem gera cobrança.</p><div class="signup-types">${[1,2,3].map(t=>{const q=quotePlan(profile,t),available=getGuidedTasks(role,t).filter(task=>task.available);return `<button type="button" data-plan-tier="${t}" aria-pressed="${selected===t}"><strong>Nível ${t}${t===requiredTier?' · Libera o recurso escolhido':''}</strong><span data-plan-price="${t}">${money(q.cents)} por período mensal</span><span>${available.length} funções de IA em todos os planos, inclusive gratuito</span><span>${t*3} treinamentos com atividades e progresso privado, sem certificado</span><span>${q.benefits.aiPercent}% do valor convertido em créditos de IA</span>${t===currentTier?'<span>Seu nível atual</span>':''}</button>`;}).join('')}</div><form id="plan-picker"><label>Nível<select name="tier"><option value="0">Gratuito</option>${[1,2,3].map(t=>`<option value="${t}" ${selected===t?'selected':''}>Nível ${t}</option>`).join('')}</select></label><label>Período<select name="cycle">${Object.entries(cycles).map(([key,c])=>`<option value="${key}">${c.label}</option>`).join('')}</select></label><p id="plan-quote" class="hint" aria-live="polite"></p></form></section>`;
}
