import {ownerTestAccess,requestedTestRole} from './owner-test-access.mjs';
import {learningBucket,learningMetadata,learningManagement,checkLearningPassword} from './oeo-learning.mjs';
import {createClient} from '@supabase/supabase-js';
import {readTaskTier} from './ai-task-access.mjs';
import {trainingRoles,trainingCatalog,findTraining,trainingContent,gradeTraining} from './training-catalog.mjs';
const columns='training_id,completed_lessons,best_score,activity_ack,completed_at,updated_at';
export function trainingHandler({env=process.env,clientFactory=createClient}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 const action=String(req.query?.action||'').replace(/^training-/,'');
 if(!['catalog','open','progress','quiz','delete','asset','manage-list','manage-save','manage-upload','manage-remove'].includes(action))return res.status(404).json({error:'Treinamento não encontrado.'});
 if(req.method!==(['catalog','open','manage-list'].includes(action)?'GET':'POST'))return res.status(405).json({error:'Método inválido.'});
 if(req.method==='POST'&&(req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site'))return res.status(403).json({error:'Origem inválida.'});
 if(req.method==='POST'&&(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>4000))return res.status(400).json({error:'Dados inválidos.'});
 const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];if(!token)return res.status(401).json({error:'Entre na sua conta confirmada.'});
 if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Treinamentos em configuração.'});
 try{
  const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const auth=await db.auth.getUser(token),user=auth.data?.user;
  if(auth.error||!user?.email_confirmed_at||user.banned_until&&Date.parse(user.banned_until)>Date.now())return res.status(401).json({error:'Entre com sua conta confirmada.'});
  const membership=await db.from('pilot_memberships').select('role,status,is_fictitious').eq('cohort_id',env.PILOT_COHORT_ID).eq('user_id',user.id).maybeSingle();
  if(membership.error)throw Error();const ownerTest=ownerTestAccess(env,user.id,membership.data,requestedTestRole(req)),role=ownerTest.role;
  if(membership.data?.status!=='active'||membership.data?.is_fictitious||!trainingRoles.includes(role))return res.status(403).json({error:'Este perfil não tem acesso aos treinamentos.'});
  const owner=membership.data.role==='pilot_owner';
  if(action.startsWith('manage-'))return await learningManagement({db,req,res,userId:user.id,cohort:env.PILOT_COHORT_ID,owner});
  const scope=()=>db.from('portal_training_progress').select(columns).eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).eq('profile_role',role);
  if(action==='catalog'){
   const tier=ownerTest.enabled?4:await readTaskTier(db,user.id,role,env.PILOT_COHORT_ID),progress=await scope();if(progress.error)throw Error();
   const custom=await db.from('portal_oeo_learning').select('*').eq('cohort_id',env.PILOT_COHORT_ID).eq('published',true).contains('audiences',[role]).order('created_at');if(custom.error)throw Error();
   return res.status(200).json({ownerTesting:ownerTest.enabled,role,tier,canManage:owner,courses:[...trainingCatalog(role,tier),...(custom.data||[]).map(r=>learningMetadata(r,tier))],progress:progress.data||[]});
  }
  const id=req.method==='GET'?req.query?.id:req.body?.id;
  if(action==='asset'){
   if(typeof id!=='string'||! /^[\da-f-]{36}$/i.test(id))return res.status(404).json({error:'Material não encontrado.'});
   const result=await db.from('portal_oeo_learning').select('*').eq('cohort_id',env.PILOT_COHORT_ID).eq('id',id).maybeSingle();if(result.error)throw Error();const row=result.data;
   if(!row||!owner&&(!row.published||!row.audiences.includes(role)))return res.status(404).json({error:'Material não disponível para seu perfil.'});
   if(!owner&&await readTaskTier(db,user.id,role,env.PILOT_COHORT_ID)<row.tier)return res.status(403).json({error:'Este material exige plano nível '+row.tier+'.',requiredTier:row.tier});
   if(!owner&&!checkLearningPassword(req.body?.password,row.password_hash))return res.status(403).json({error:'Senha adicional incorreta.'});
   let url=row.external_url;if(row.source_type!=='link'){const signed=await db.storage.from(learningBucket).createSignedUrl(row.asset_path,60,{download:true});if(signed.error)throw Error();url=signed.data.signedUrl;}
   return res.status(200).json({url,title:row.title,sourceType:row.source_type,external:row.source_type==='link',ownerPreview:owner,expiresIn:row.source_type==='link'?null:60});
  }
  const course=findTraining(id,role);if(!course)return res.status(404).json({error:'Treinamento não encontrado para seu perfil.'});
  if(action==='delete'){
   if(req.body?.confirm!==true)return res.status(400).json({error:'Confirme a exclusão do progresso.'});
   const removed=await db.from('portal_training_progress').delete().eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).eq('profile_role',role).eq('training_id',id);if(removed.error)throw Error();
   return res.status(200).json({deleted:true});
  }
  if(!ownerTest.enabled&&await readTaskTier(db,user.id,role,env.PILOT_COHORT_ID)<course.tier)return res.status(403).json({error:'Este treinamento exige plano nível '+course.tier+' ou superior.',requiredTier:course.tier});
  if(action==='open'){
   const progress=await scope().eq('training_id',id).maybeSingle();if(progress.error)throw Error();
   return res.status(200).json({course:trainingContent(course),progress:progress.data});
  }
  let lesson=null,score=null,activity=false,graded=null;
  if(action==='quiz'){try{graded=gradeTraining(course,req.body?.answers);score=graded.score;}catch{return res.status(400).json({error:'Responda todas as perguntas com uma opção válida.'});}}
  else if(Number.isInteger(req.body?.lesson)&&req.body.lesson>=0&&req.body.lesson<course.lessons.length)lesson=req.body.lesson;
  else if(req.body?.activity===true)activity=true;
  else return res.status(400).json({error:'Selecione uma aula válida ou confirme a atividade.'});
  const saved=await db.rpc('portal_training_record',{p_user:user.id,p_cohort:env.PILOT_COHORT_ID,p_profile:role,p_training:id,p_lesson:lesson,p_score:score,p_activity:activity});if(saved.error)throw Error();
  return res.status(200).json({progress:saved.data,...(graded||{})});
 }catch{return res.status(503).json({error:'Não foi possível consultar ou salvar o treinamento. Tente novamente; nenhum crédito é consumido nesta área.'});}
};}
