import {createClient} from '@supabase/supabase-js';
export function discoveryHandler({env=process.env,clientFactory=createClient}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Método inválido.'});
 const kind=req.query?.kind||'all',page=Number(req.query?.page??0),size=Number(req.query?.size??50);
 if(!['job','course','training','learning','all','candidates'].includes(kind)||!Number.isInteger(page)||page<0||page>1000||![30,50].includes(size)||typeof req.query?.query==='object')return res.status(400).json({error:'Filtro inválido.'});
 if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Busca em configuração.'});
 try{
  const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  if(kind==='candidates'&&req.headers.authorization){
   const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization)?.[1];if(!token)return res.status(401).json({error:'Sessão inválida.'});
   const auth=await db.auth.getUser(token),u=auth.data?.user;if(auth.error||!u?.email_confirmed_at||u.banned_until&&Date.parse(u.banned_until)>Date.now())return res.status(401).json({error:'Entre novamente.'});
   const m=await db.from('pilot_memberships').select('role,status').eq('user_id',u.id).eq('cohort_id',env.PILOT_COHORT_ID).maybeSingle();if(m.error)throw Error();
   if(m.data?.status!=='active'||!['recruiter','school_staff','pilot_owner'].includes(m.data.role))return res.status(403).json({error:'Busca de talentos indisponível neste perfil.'});
  }
  const result=await db.rpc('portal_ordered_public_feed',{p_cohort:env.PILOT_COHORT_ID,p_kind:kind,p_query:String(req.query?.query||'').replace(/[%_]/g,'').trim().slice(0,100),p_page:page,p_size:size});if(result.error)throw Error();
  const items=result.data||[];let bytes=Buffer.byteLength(JSON.stringify(items));for(let i=items.length-1;i>=0&&bytes>3000000;i--){for(const key of ['logo_data','photo_data'])if(items[i][key]){bytes-=Buffer.byteLength(JSON.stringify(items[i][key]));items[i][key]='';}}
  return res.status(200).json({items});
 }catch{return res.status(503).json({error:'Não foi possível carregar as oportunidades. Tente novamente.'});}
};}
