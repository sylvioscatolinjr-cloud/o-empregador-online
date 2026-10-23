// Explicit release smoke test only, not run by normal builds. Uses synthetic criteria.
import {externalOptions,externalResult} from '../src/ai-external-search.mjs';
import {createAgentRequest} from '../src/ai-agent-policy.mjs';
import {getGuidedTasks} from '../src/ai-agent-catalog.mjs';
export async function verifyPremiumProvider(env=process.env){
 if(!env.OPENAI_API_KEY||!env.AI_CHAT_MODEL)throw Error('Premium provider configuration missing');
 for(const mode of ['standard','expanded']){
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:AbortSignal.timeout(65000),headers:{Authorization:'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:env.AI_EXTERNAL_MODEL||env.AI_CHAT_MODEL,store:false,max_output_tokens:1200,...externalOptions(mode),input:'Localize a página oficial do SENAI São Paulo sobre cursos de qualificação profissional. Cite a fonte com link. Não use dados pessoais. Responda em português em até 200 palavras.'})});
  if(!r.ok)throw Error('Premium provider HTTP '+r.status);
  const data=externalResult(await r.json());console.log('PREMIUM_SEARCH_SMOKE '+JSON.stringify({mode,completed:true,citations:data.citations.length}));
 }
 for(const role of ['recruiter','school_staff']){
  const task=getGuidedTasks(role).find(t=>t.id==='social_posts_'+role),request=createAgentRequest({role,question:role==='school_staff'?'Curso fictício de impressão 3D, 12 horas, público adulto, inscrições abertas, Campinas. Divulgar no Instagram. Datas e preço ainda não definidos.':'Empresa fictícia de impressão 3D, protótipos sob encomenda em Campinas. Divulgação no Instagram. Sem promoção.'});
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:AbortSignal.timeout(30000),headers:{Authorization:'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:env.AI_CHAT_MODEL,store:false,max_output_tokens:1800,input:[{role:'system',content:request.system+' '+task.instruction},{role:'user',content:request.user}]})});
  if(!r.ok)throw Error('Posts provider HTTP '+r.status);const data=await r.json();const text=(data.output||[]).flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text).join('\n');if(data.status!=='completed'||text.length<100)throw Error('Posts provider incomplete');console.log('POSTS_SMOKE '+JSON.stringify({role,completed:true,characters:text.length}));
 }
}
