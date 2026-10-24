import {createClient} from '@supabase/supabase-js';
import {ownerTestAccess,requestedTestRole} from './owner-test-access.mjs';
import {postImageContent} from './post-image-input.mjs';
import {imageOptions,generatePublicationImage} from './publication-image.mjs';
const bucket='oeo-ai-images';
export function publicationImageHandler({env=process.env,clientFactory=createClient,fetchImpl=fetch}={}){
 return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 const action=req.query?.action,method=action==='image-list'?'GET':'POST';
 if(!['image-list','image-create','image-delete'].includes(action))return res.status(404).json({error:'Recurso não encontrado.'});
 if(req.method!==method)return res.status(405).json({error:'Método inválido.'});
 if(method==='POST'&&(req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site'))return res.status(403).json({error:'Origem inválida.'});
 if(method==='POST'&&(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>1500000))return res.status(400).json({error:'Formato inválido.'});
 const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];if(!token)return res.status(401).json({error:'Entre na sua conta.'});
 if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Serviço indisponível.'});
 try{
 const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}}),auth=await db.auth.getUser(token),user=auth.data?.user;
 if(auth.error||!user?.email_confirmed_at||user.banned_until&&Date.parse(user.banned_until)>Date.now())return res.status(401).json({error:'Confirme sua conta.'});
 const member=await db.from('pilot_memberships').select('role,status,is_fictitious').eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).maybeSingle();if(member.error)throw Error();
 const owner=ownerTestAccess(env,user.id,member.data,requestedTestRole(req));
 if(member.data?.status!=='active'||member.data?.is_fictitious||!['learner','recruiter','school_staff'].includes(owner.role)||(!owner.enabled&&member.data.role!==owner.role))return res.status(403).json({error:'Perfil não autorizado.'});
 const scope=q=>q.eq('user_id',user.id).eq('cohort_id',env.PILOT_COHORT_ID).eq('profile_role',owner.role);
 const present=async job=>{let url=null;if(job.status==='completed'&&job.storage_path){const link=await db.storage.from(bucket).createSignedUrl(job.storage_path,60,{download:'publicacao-oeo.png'});if(!link.error)url=link.data?.signedUrl||null;}return {id:job.id,status:job.status,quality:job.quality,ratio:job.ratio,cents:job.cents,ownerTesting:job.owner_testing,createdAt:job.created_at,url};};
 if(action==='image-list'){const result=await scope(db.from('portal_ai_image_jobs').select('id,status,quality,ratio,cents,owner_testing,created_at,storage_path')).order('created_at',{ascending:false}).limit(20);if(result.error)throw Error();return res.status(200).json({ownerTesting:owner.enabled,role:owner.role,jobs:await Promise.all((result.data||[]).map(present))});}
 if(action==='image-delete'){
 if(!/^[0-9a-f-]{36}$/i.test(req.body?.id||''))return res.status(400).json({error:'Imagem inválida.'});
 const found=await scope(db.from('portal_ai_image_jobs').select('*')).eq('id',req.body.id).maybeSingle();if(found.error)throw Error();const job=found.data;if(!job)return res.status(404).json({error:'Imagem não encontrada.'});if(job.status!=='completed')return res.status(409).json({error:'Somente imagens concluídas podem ser excluídas.'});
 if(job.storage_path){const removed=await db.storage.from(bucket).remove([job.storage_path]);if(removed.error)throw Error();}
 const saved=await scope(db.from('portal_ai_image_jobs').update({storage_path:null,status:'deleted',updated_at:new Date().toISOString()})).eq('id',job.id);if(saved.error)throw Error();return res.status(200).json({deleted:true});
 }
 let opts,images;try{opts=imageOptions(req.body);images=postImageContent(req.body,true).filter(c=>c.type==='input_image');if(JSON.stringify({...req.body,postImages:undefined}).length>9000)throw Error('Texto muito grande.');}catch(e){return res.status(400).json({error:e.message});}
 if(env.AI_IMAGE_GENERATION_ENABLED==='false'||env.AI_CHAT_METERING_ENABLED!=='true'||!env.OPENAI_API_KEY)return res.status(503).json({error:'Geração de imagem indisponível. Nenhum crédito reservado.'});
 const reserved=await db.rpc('portal_ai_image_reserve',{p_user:user.id,p_cohort:env.PILOT_COHORT_ID,p_id:req.body.requestId,p_role:owner.role,p_quality:req.body.quality,p_ratio:req.body.ratio,p_owner:owner.enabled});
 if(reserved.error)return res.status(409).json({error:'Não foi possível reservar esta geração: confira saldo, limite de testes ou um pedido pendente. Atualize o histórico antes de repetir.'});
 const job=reserved.data.job;if(!reserved.data.isNew)return res.status(200).json({job:await present(job),reused:true});
 const review=async()=>{await scope(db.from('portal_ai_image_jobs').update({status:'review',updated_at:new Date().toISOString()})).eq('id',job.id).eq('status','processing');};
 try{
 const bytes=await generatePublicationImage({env,question:req.body.question,role:owner.role,quality:req.body.quality,ratio:req.body.ratio,images,fetchImpl});
 const path=user.id+'/'+job.id+'.png',uploaded=await db.storage.from(bucket).upload(path,bytes,{contentType:'image/png',upsert:false,cacheControl:'0'});if(uploaded.error)throw Error('Storage failed');
 const saved=await scope(db.from('portal_ai_image_jobs').update({status:'completed',storage_path:path,updated_at:new Date().toISOString()})).eq('id',job.id).eq('status','processing');if(saved.error)throw Error('Persistence failed');
 return res.status(200).json({job:await present({...job,status:'completed',storage_path:path}),creditsCharged:owner.enabled?0:opts.price/100});
 }catch(e){
 if(e.definite){const failed=await db.rpc('portal_ai_image_fail',{p_user:user.id,p_cohort:env.PILOT_COHORT_ID,p_id:job.id});if(!failed.error)return res.status(502).json({error:owner.enabled?'A IA recusou a geração. Sem débito na carteira; tentativa contabilizada no limite de testes.':'A IA recusou a geração. Reserva devolvida à carteira.',jobId:job.id});}
 await review();return res.status(202).json({job:await present({...job,status:'review'}),message:'Resultado pendente de verificação. Não gere novamente: consulte o histórico ou atendimento com a referência '+job.id+'. A reserva aguarda conciliação; não há promessa de estorno da API.'});
 }
 }catch{return res.status(503).json({error:'Não foi possível confirmar a operação. Atualize o histórico antes de repetir a geração.'});}
 };
}
