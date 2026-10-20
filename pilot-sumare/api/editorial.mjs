import {createClient} from '@supabase/supabase-js';
import {timingSafeEqual} from 'node:crypto';
import {generateEditorial,themes,categories} from '../src/editorial-agent.mjs';
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const same=(a,b)=>!!a&&!!b&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
export function editorialHandler({clientFactory=createClient,generate=generateEditorial,env=process.env,now=()=>new Date()}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Método inválido.'});
 const scheduled=req.query?.action==='scheduled';
 if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Configuração editorial indisponível.'});
 if(scheduled&&(!same(req.headers.authorization,'Bearer '+env.CRON_SECRET)||!env.CRON_SECRET))return res.status(401).json({error:'Agendamento não autorizado.'});
 if(!scheduled&&req.method==='POST'&&(req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site'))return res.status(403).json({error:'Origem inválida.'});
 if(!scheduled&&req.method==='POST'&&(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>35000))return res.status(400).json({error:'Formato ou tamanho inválido.'});
 const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}}),cohort=env.PILOT_COHORT_ID;
 let runId;
 try{
  let user;
  if(scheduled){
   if(env.EDITORIAL_SCHEDULE_ENABLED!=='true')return res.status(200).json({paused:true});
   const owner=await db.from('pilot_memberships').select('user_id').eq('cohort_id',cohort).eq('role','pilot_owner').eq('status','active').limit(1).maybeSingle();if(owner.error||!owner.data)throw Error('Proprietário indisponível.');user={id:owner.data.user_id};
  }else{
   const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];if(!token)return res.status(401).json({error:'Entre na sua conta.'});
   const auth=await db.auth.getUser(token);user=auth.data?.user;if(auth.error||!user?.email_confirmed_at)return res.status(401).json({error:'Entre com e-mail confirmado.'});
   const m=await db.from('pilot_memberships').select('role,status').eq('cohort_id',cohort).eq('user_id',user.id).maybeSingle();if(m.error)throw Error('Permissões indisponíveis.');if(m.data?.role!=='pilot_owner'||m.data?.status!=='active')return res.status(403).json({error:'Área exclusiva do proprietário.'});
  }
  if(!scheduled&&req.method==='GET'){
   const [items,runs]=await Promise.all([db.from('portal_editorial_items').select('*').eq('cohort_id',cohort).order('created_at',{ascending:false}).limit(100),db.from('portal_editorial_runs').select('id,action,status,usage,error,created_at,finished_at').eq('cohort_id',cohort).order('created_at',{ascending:false}).limit(20)]);
   if(items.error||runs.error)throw Error('Não foi possível carregar a redação.');
   return res.status(200).json({items:items.data,runs:runs.data,ready:!!env.OPENAI_API_KEY&&!!env.EDITORIAL_AI_MODEL,scheduled:env.EDITORIAL_SCHEDULE_ENABLED==='true'&&!!env.CRON_SECRET,limits:{researchPerDay:1,draftsPerWeek:3},model:env.EDITORIAL_AI_MODEL||null});
  }
  const b=scheduled?{action:'research',theme:['law','hiring','career','interview'][now().getUTCDay()%4]}:req.body||{};
  const action=b.action;
  if(!['research','draft','save','discard','send'].includes(action))return res.status(400).json({error:'Ação inválida.'});
  let item;
  if(action!=='research'){
   if(!uuid(b.id))return res.status(400).json({error:'Pauta inválida.'});
   const q=await db.from('portal_editorial_items').select('*').eq('id',b.id).eq('cohort_id',cohort).maybeSingle();if(q.error)throw Error('Falha ao consultar pauta.');item=q.data;if(!item)return res.status(404).json({error:'Pauta não encontrada.'});
   if(action!=='send'&&['sent','discarded'].includes(item.status))return res.status(409).json({error:'Pauta já encerrada. Edite a matéria pelo blog.'});
  }
  if(action==='send'){
   const r=await db.rpc('portal_editorial_send',{p_actor:user.id,p_cohort:cohort,p_item:item.id});if(r.error)return res.status(409).json({error:'Revise e salve o rascunho. Sua conta também precisa ser editora do blog.'});return res.status(200).json({blogPostId:r.data,message:'Rascunho enviado ao blog. A publicação exige sua revisão no editor.'});
  }
  if(['save','discard'].includes(action)){
   let patch={status:'discarded',updated_at:new Date().toISOString()};
   if(action==='save'){
    if(item.status!=='review'||typeof b.title!=='string'||b.title.trim().length<5||b.title.length>160||typeof b.summary!=='string'||b.summary.trim().length<10||b.summary.length>400||typeof b.body!=='string'||b.body.trim().length<30||b.body.length>30000||!categories.includes(b.category))return res.status(400).json({error:'Confira título, resumo, categoria e texto.'});
    patch={title:b.title.trim(),summary:b.summary.trim(),body:b.body.trim(),category:b.category,updated_at:new Date().toISOString()};
   }
   const r=await db.from('portal_editorial_items').update(patch).eq('id',item.id).eq('cohort_id',cohort).eq('updated_at',b.updated_at||item.updated_at).select('id');if(r.error)throw Error('Não foi possível salvar.');if(!r.data?.length)return res.status(409).json({error:'Pauta alterada em outra aba. Atualize antes de salvar.'});return res.status(200).json({saved:true});
  }
  if(!env.OPENAI_API_KEY||!env.EDITORIAL_AI_MODEL)return res.status(503).json({error:'Pesquisa de IA ainda não ativada. Configure a credencial e o modelo no servidor.'});
  if(action==='research'&&!Object.hasOwn(themes,b.theme))return res.status(400).json({error:'Escolha um tema disponível.'});
  if(action==='draft'&&item.status!=='suggested')return res.status(409).json({error:'Esta pauta já possui rascunho.'});
  const reserve=await db.rpc('portal_editorial_reserve',{p_actor:user.id,p_cohort:cohort,p_action:action});if(reserve.error)return res.status(429).json({error:'Limite editorial atingido: 1 pesquisa por dia e 3 rascunhos por semana. Tentativas com falha também contam.'});runId=reserve.data;
  const recent=await db.from('portal_editorial_items').select('title').eq('cohort_id',cohort).order('created_at',{ascending:false}).limit(100);if(recent.error)throw Error('Histórico editorial indisponível.');
  const generated=await generate({env,action,theme:b.theme,item,recent:recent.data.map(x=>x.title)});
  let firstSuggested;
  if(action==='research'){
   if(generated.items.length){const r=await db.from('portal_editorial_items').insert(generated.items.map(x=>({...x,cohort_id:cohort,run_id:runId}))).select('*');if(r.error)throw Error('Não foi possível guardar as pautas.');firstSuggested=r.data?.[0];}
  }else{
   const r=await db.from('portal_editorial_items').update({...generated.item,status:'review',updated_at:new Date().toISOString()}).eq('id',item.id).eq('status','suggested').eq('updated_at',item.updated_at).select('id');if(r.error||!r.data?.length)throw Error('A pauta mudou durante a geração. Atualize a redação.');
  }
  const done=await db.from('portal_editorial_runs').update({status:'completed',usage:generated.usage,finished_at:new Date().toISOString()}).eq('id',runId);if(done.error)throw Error('Não foi possível concluir o histórico.');
  if(scheduled&&firstSuggested&&[1,3,5].includes(now().getUTCDay())){
   const next=await db.rpc('portal_editorial_reserve',{p_actor:user.id,p_cohort:cohort,p_action:'draft'});
   if(!next.error){runId=next.data;const article=await generate({env,action:'draft',item:firstSuggested});const saved=await db.from('portal_editorial_items').update({...article.item,status:'review',updated_at:new Date().toISOString()}).eq('id',firstSuggested.id).eq('status','suggested').eq('updated_at',firstSuggested.updated_at).select('id');if(saved.error||!saved.data?.length)throw Error('A pauta mudou durante a geração.');const finished=await db.from('portal_editorial_runs').update({status:'completed',usage:article.usage,finished_at:new Date().toISOString()}).eq('id',runId);if(finished.error)throw Error('Não foi possível concluir o histórico.');}
  }
  return res.status(200).json({saved:true,count:generated.items?.length||1,message:action==='research'?'Pesquisa concluída. As pautas aguardam sua seleção.':'Rascunho preparado para sua revisão.'});
 }catch(error){
  const safe=['A IA retornou','A pesquisa não foi','O serviço de pesquisa','A pauta mudou','Não foi possível','Histórico editorial','Permissões indisponíveis'].some(x=>error.message?.startsWith(x))?error.message:'Não foi possível concluir a operação editorial.';
  if(runId)await db.from('portal_editorial_runs').update({status:'failed',error:safe,finished_at:new Date().toISOString()}).eq('id',runId);
  return res.status(503).json({error:safe});
 }
};}
export default editorialHandler();
