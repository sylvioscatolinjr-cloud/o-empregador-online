import {createClient} from '@supabase/supabase-js';
import {lookupPostal,warmPostalCoordinates} from './postal-coordinates.mjs';
export function distanceDiscoveryHandler({env=process.env,clientFactory=createClient,lookup=lookupPostal,warm=warmPostalCoordinates}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Método inválido.'});
 const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];if(!token)return res.status(401).json({error:'Entre novamente para usar o CEP de referência.'});
 const b=req.body||{},postal=String(b.postal||'').replace(/\D/g,''),kind=b.kind||'all',page=Number(b.page??0);
 if(!/^\d{8}$/.test(postal)||!['job','course','training','learning','all','candidates'].includes(kind)||!Number.isInteger(page)||page<0||page>1000||b.query!==undefined&&typeof b.query!=='string')return res.status(400).json({error:'Confira o CEP de referência e os filtros.'});
 if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Busca em configuração.'});
 try{
  const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}}),a=await db.auth.getUser(token),u=a.data?.user;
  if(a.error||!u?.email_confirmed_at||u.banned_until&&Date.parse(u.banned_until)>Date.now())return res.status(401).json({error:'Entre novamente.'});
  const m=await db.from('pilot_memberships').select('role,status').eq('user_id',u.id).eq('cohort_id',env.PILOT_COHORT_ID).maybeSingle();if(m.error)throw Error();if(m.data?.status!=='active'||!['learner','recruiter','school_staff','pilot_owner'].includes(m.data.role))return res.status(403).json({error:'Busca indisponível para esta conta.'});
  if(kind==='candidates'&&!['recruiter','school_staff','pilot_owner'].includes(m.data.role))return res.status(403).json({error:'Busca de currículos indisponível neste perfil.'});
  const rate=await db.rpc('portal_distance_search_allowed',{p_user:u.id});if(rate.error)throw Error();if(!rate.data)return res.status(429).json({error:'Limite de 30 consultas por CEP nesta hora. Você pode continuar buscando sem CEP.'});
  const origin=await lookup(postal);if(!origin)return res.status(503).json({error:'Não foi possível localizar esse CEP agora. Confira o CEP ou busque sem ele.'});
  const coverage=kind==='candidates'?{missing:0}:await warm(db,env.PILOT_COHORT_ID,{lookup});
  const args={p_cohort:env.PILOT_COHORT_ID,p_kind:kind,p_query:String(b.query||'').replace(/[%_]/g,'').trim().slice(0,100),p_page:page,p_size:30,p_lat:origin.latitude,p_lon:origin.longitude};if(kind==='candidates'){delete args.p_kind;delete args.p_size;args.p_city=String(b.city||'').slice(0,100);args.p_senai=b.senai==='on';}
  const r=await db.rpc(kind==='candidates'?'portal_distance_candidate_search':'portal_distance_public_feed',args);if(r.error)throw Error();
  const items=r.data||[];let bytes=Buffer.byteLength(JSON.stringify(items));for(let i=items.length-1;i>=0&&bytes>3000000;i--){for(const key of ['logo_data','photo_data'])if(items[i][key]){bytes-=Buffer.byteLength(JSON.stringify(items[i][key]));items[i][key]='';}}
  return res.status(200).json({items,distanceNotice:kind==='candidates'?'Proximidade usa somente a região aproximada que cada candidato autorizou (área de cerca de 10 km). Quem não autorizou permanece nos resultados, sem desempate por proximidade. Endereços e coordenadas não são exibidos.':'Distância aproximada em linha reta entre áreas dos CEPs; não representa trajeto ou tempo de viagem. Anúncios online ou sem coordenadas não têm distância calculada.'+(coverage.missing?' Há CEPs de anúncios ainda sem coordenadas; nesses casos, o desempate por distância fica depois dos anúncios com distância conhecida.':'')});
 }catch{return res.status(503).json({error:'Não foi possível calcular a proximidade. Tente novamente ou busque sem CEP.'});}
};}
