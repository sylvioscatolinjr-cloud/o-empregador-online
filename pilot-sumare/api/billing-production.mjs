import {createClient} from '@supabase/supabase-js';
import {productionBillingReadiness} from '../src/billing-production.mjs';
export function productionStatusHandler({env=process.env,clientFactory=createClient,fetchImpl=fetch}={}) {return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Somente consulta. Cobrança real ainda não ativada.'});
 const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];
 if(!token)return res.status(401).json({error:'Entre na sua conta.'});
 if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Administração indisponível.'});
 try {
 const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const auth=await db.auth.getUser(token),user=auth.data?.user;
 if(auth.error||!user?.email_confirmed_at)return res.status(401).json({error:'Confirme seu e-mail e entre novamente.'});
 const member=await db.from('pilot_memberships').select('role,status').eq('cohort_id',env.PILOT_COHORT_ID).eq('user_id',user.id).maybeSingle();
 if(member.error)throw Error();
 if(member.data?.role!=='pilot_owner'||member.data?.status!=='active')return res.status(403).json({error:'Área exclusiva do proprietário.'});
 return res.status(200).json(await productionBillingReadiness({env,fetchImpl}));
 }catch{return res.status(503).json({error:'Não foi possível conferir a conexão de produção. Nenhuma cobrança foi criada.'});}
};}
export default productionStatusHandler();
