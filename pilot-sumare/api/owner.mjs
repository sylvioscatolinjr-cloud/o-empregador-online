import {createClient} from '@supabase/supabase-js';
import {metricPeriod,broadcastInput} from '../src/owner-operations.mjs';
export function ownerHandler(clientFactory=createClient,env=process.env){return async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Método inválido.'});
 const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];
 if(!token)return res.status(401).json({error:'Entre na sua conta.'});
 const e=env;
 if(!e.SUPABASE_URL||!e.SUPABASE_SECRET_KEY||!e.PILOT_COHORT_ID)return res.status(503).json({error:'Administração indisponível.'});
 if(req.method==='POST'&&(req.headers.origin!==e.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site'))return res.status(403).json({error:'Origem inválida.'});
 if(req.method==='POST'&&(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>10000))return res.status(400).json({error:'Formato ou tamanho inválido.'});
 try{
  const db=clientFactory(e.SUPABASE_URL,e.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const auth=await db.auth.getUser(token),user=auth.data?.user;
  if(auth.error||!user?.email_confirmed_at)return res.status(401).json({error:'Entre com e-mail confirmado.'});
  const member=await db.from('pilot_memberships').select('role,status').eq('cohort_id',e.PILOT_COHORT_ID).eq('user_id',user.id).maybeSingle();
  if(member.error)throw Error();
  if(member.data?.role!=='pilot_owner'||member.data?.status!=='active')return res.status(403).json({error:'Área exclusiva do proprietário.'});
  const args={p_actor:user.id,p_cohort:e.PILOT_COHORT_ID};
  if(req.method==='GET'){
   let period;try{period=metricPeriod(req.query?.period||'month');}catch{return res.status(400).json({error:'Período inválido.'});}
   const r=await db.rpc('portal_owner_metrics',{...args,p_start:period.start,p_end:period.end,p_bucket:period.bucket});if(r.error)throw Error();
   const demo=await db.rpc('portal_demo_communication_report',args);if(demo.error)throw Error();
   return res.status(200).json({...r.data,demo:demo.data,scope:'Novos registros reais no período, no horário de Brasília. Contas fictícias e participações em anúncios fictícios estão excluídas. Currículos incluem perfis de candidatos ainda sem preenchimento completo. Receita real: R$ 0,00; pagamentos de teste não são faturamento.'});
  }
  if(req.body?.action==='activate'){
   const email=String(req.body.email||'').trim().toLowerCase();if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({error:'Confira o e-mail.'});
   const r=await db.rpc('portal_activate_test_account',{...args,p_email:email});if(r.error)return res.status(409).json({error:'A conta precisa ter e-mail confirmado, CPF/CNPJ concluído e não pode possuir vínculo suspenso. Confira esses passos.'});return res.status(200).json({message:r.data});
  }
  if(['preview','broadcast'].includes(req.body?.action)){
   let filters;try{filters=broadcastInput(req.body);}catch(error){return res.status(400).json({error:error.message});}
   const r=await db.rpc('portal_broadcast',{...args,...filters,p_send:req.body.action==='broadcast'});if(r.error)throw Error();return res.status(200).json(req.body.action==='broadcast'?{sent:r.data}:{count:r.data});
  }
  return res.status(400).json({error:'Ação inválida.'});
 }catch{return res.status(503).json({error:'Não foi possível concluir a operação administrativa.'});}
};}
export default ownerHandler();
