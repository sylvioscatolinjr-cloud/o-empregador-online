import {createClient} from '@supabase/supabase-js';
export function organizationPointsHandler({env=process.env,clientFactory=createClient}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Método inválido.'});
 const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];
 if(!token)return res.status(401).json({error:'Entre novamente.'});
 if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Consulta em configuração.'});
 try{
  const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const auth=await db.auth.getUser(token),u=auth.data?.user;
  if(auth.error||!u?.email_confirmed_at||u.banned_until&&Date.parse(u.banned_until)>Date.now())return res.status(401).json({error:'Entre novamente.'});
  const m=await db.from('pilot_memberships').select('role,status').eq('user_id',u.id).eq('cohort_id',env.PILOT_COHORT_ID).maybeSingle();
  if(m.error)throw Error();if(m.data?.status!=='active'||!['recruiter','school_staff'].includes(m.data.role))return res.status(403).json({error:'Consulta exclusiva do responsável pela organização.'});
  const r=await db.rpc('portal_organization_points',{p_org:u.id,p_cohort:env.PILOT_COHORT_ID});if(r.error)throw Error();
  return res.status(200).json(r.data);
 }catch{return res.status(503).json({error:'Não foi possível consultar a pontuação. Tente novamente.'});}
};}
