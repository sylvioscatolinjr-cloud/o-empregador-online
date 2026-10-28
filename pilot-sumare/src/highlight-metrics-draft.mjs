// Draft only. Counts are approximate, deduplicated per browser session/day.
import {createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function highlightMetricsHandler({env=process.env,clientFactory=createClient,clock=()=>new Date()}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Método inválido.'});
 if(req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'Origem inválida.'});
 if(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>512)return res.status(400).json({error:'Formato inválido.'});
 const {kind,targetId,event,session}=req.body||{};
 if(!['candidate','job','course','training'].includes(kind)||!uuid.test(targetId||'')||!uuid.test(session||'')||!['view','click'].includes(event))return res.status(400).json({error:'Medição inválida.'});
 if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Medição indisponível.'});
 try{
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(clock());
  const digest=createHash('sha256').update(day+'|'+session.toLowerCase()).digest('hex');
  const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const r=await db.rpc('portal_highlight_record_metric',{p_cohort:env.PILOT_COHORT_ID,p_kind:kind,p_target:targetId,p_event:event,p_digest:digest});
  if(r.error)throw Error();
  // A small fraction of events performs bounded cleanup; it is not a guarantee
  // that old keys disappear on a particular date when there is no traffic.
  if(parseInt(digest.slice(0,2),16)<3)await db.rpc('portal_highlight_metric_cleanup');
  return res.status(204).end();
 }catch{return res.status(503).json({error:'Medição indisponível.'});}
};}
