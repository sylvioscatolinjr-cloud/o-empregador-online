import {randomBytes,scryptSync,timingSafeEqual,randomUUID} from 'node:crypto';
export const learningBucket='oeo-learning-private';
export const learningTypes={pdf:'application/pdf',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation'};
export function learningInput(body){
 const text=k=>String(body[k]||'').trim();const record={kind:text('kind'),module:text('module'),title:text('title'),description:text('description'),tier:body.tier,audiences:body.audiences,published:body.published===true,source_type:text('source_type')};
 if(!['course','training'].includes(record.kind)||record.module.length<2||record.module.length>100||record.title.length<3||record.title.length>160||record.description.length<20||record.description.length>1000||!Number.isInteger(record.tier)||record.tier<0||record.tier>4||!Array.isArray(record.audiences)||!record.audiences.length||record.audiences.length>3||new Set(record.audiences).size!==record.audiences.length||record.audiences.some(r=>!['learner','recruiter','school_staff'].includes(r))||!['pdf','pptx','link'].includes(record.source_type))throw Error('Confira público, módulo, título, descrição, nível e formato.');
 if(record.source_type==='link'){let u;try{u=new URL(text('external_url'));}catch{throw Error('Informe um link HTTPS válido.');}if(u.protocol!=='https:'||u.username||u.password||u.href.length>2000)throw Error('Use um link HTTPS sem credenciais na URL.');record.external_url=u.href;record.asset_path=null;}
 return record;
}
export function hashLearningPassword(value){if(typeof value!=='string'||value.length<6||value.length>100)throw Error('A senha adicional deve ter entre 6 e 100 caracteres.');const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(value,salt,32).toString('hex');}
export function checkLearningPassword(value,stored){if(!stored)return true;if(typeof value!=='string'||value.length>100)return false;const [salt,hash]=stored.split(':');const expected=Buffer.from(hash||'','hex');return expected.length===32&&timingSafeEqual(expected,scryptSync(value,salt,32));}
export function validLearningFile(buffer,type){if(buffer.length<10||buffer.length>20971520)return false;if(type==='pdf')return buffer.subarray(0,5).toString()==='%PDF-';if(type==='pptx')return buffer.subarray(0,2).toString()==='PK'&&buffer.includes(Buffer.from('[Content_Types].xml'))&&buffer.includes(Buffer.from('ppt/presentation.xml'))&&!buffer.includes(Buffer.from('vbaProject.bin'));return false;}
export function learningMetadata(row,tier){return {id:row.id,title:row.title,objective:row.description,tier:row.tier,kind:row.kind,module:row.module,sourceType:row.source_type,lessonCount:0,available:tier>=row.tier,external:true,needsPassword:!!row.password_hash};}
const uuid=value=>typeof value==='string'&&/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(value);
export async function learningManagement({db,req,res,userId,cohort,owner}){
 if(!owner)return res.status(403).json({error:'Gerenciamento exclusivo do proprietário.'});
 const action=String(req.query.action).replace('training-manage-','');
 const table=()=>db.from('portal_oeo_learning').select('*').eq('cohort_id',cohort);
 if(action==='list'){const r=await table().order('created_at',{ascending:false}).limit(200);if(r.error)throw Error();return res.status(200).json({items:(r.data||[]).map(({password_hash,...r})=>({...r,needsPassword:!!password_hash}))});}
 const id=req.body?.id;if(id&&!uuid(id))return res.status(400).json({error:'Material inválido.'});
 let existing=null;if(id){const r=await table().eq('id',id).maybeSingle();if(r.error)throw Error();existing=r.data;if(!existing)return res.status(404).json({error:'Material não encontrado.'});}
 if(action==='remove'){
  if(!existing||req.body.confirm!==true)return res.status(400).json({error:'Confirme a exclusão do material.'});
  const deleted=await db.from('portal_oeo_learning').delete().eq('id',id).eq('cohort_id',cohort);if(deleted.error)throw Error();
  if(existing.asset_path){const removed=await db.storage.from(learningBucket).remove([existing.asset_path]);if(removed.error)return res.status(200).json({deleted:true,message:'Material retirado do catálogo. O arquivo privado requer limpeza administrativa.'});}
  return res.status(200).json({deleted:true});
 }
 if(!['save','upload'].includes(action))return res.status(404).json({error:'Ação não encontrada.'});
 let record;try{record=learningInput(req.body);if(req.body.clearPassword===true)record.password_hash=null;else if(req.body.password)record.password_hash=hashLearningPassword(req.body.password);}catch(e){return res.status(400).json({error:e.message});}
 if(action==='upload'){
  if(record.source_type==='link'||id)return res.status(400).json({error:'Cadastre um novo material para substituir o arquivo.'});
  const newId=randomUUID(),path=userId+'/'+cohort+'/oeo/'+newId+'.'+record.source_type;
  const signed=await db.storage.from(learningBucket).createSignedUploadUrl(path);if(signed.error)throw Error();
  const inserted=await db.from('portal_oeo_learning').insert({...record,id:newId,asset_path:path,published:false,cohort_id:cohort,created_by:userId});if(inserted.error)throw Error();
  return res.status(200).json({id:newId,path,token:signed.data.token,bucket:learningBucket,contentType:learningTypes[record.source_type]});
 }
 if(record.source_type!=='link'){
  if(!existing||existing.source_type!==record.source_type||!existing.asset_path)return res.status(400).json({error:'Envie o arquivo antes de salvar.'});
  const file=await db.storage.from(learningBucket).download(existing.asset_path);if(file.error)throw Error();const bytes=Buffer.from(await file.data.arrayBuffer());
  if(!validLearningFile(bytes,record.source_type))return res.status(400).json({error:'Arquivo inválido. Envie PDF ou PPTX sem macros de até 20 MB.'});record.asset_path=existing.asset_path;record.external_url=null;
 }else if(existing&&existing.source_type!=='link')return res.status(400).json({error:'Para trocar o formato, cadastre um novo material e retire o anterior.'});
 const r=existing?await db.from('portal_oeo_learning').update({...record,updated_at:new Date().toISOString()}).eq('id',id).eq('cohort_id',cohort):await db.from('portal_oeo_learning').insert({...record,cohort_id:cohort,created_by:userId});if(r.error)throw Error();
 return res.status(200).json({saved:true});
}
