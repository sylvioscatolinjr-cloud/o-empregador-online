import {randomUUID} from 'node:crypto';import {noticeBucket,noticeTypes,noticeFileInput,noticeUUID} from './notice-material.mjs';import {validLearningFile} from './oeo-learning.mjs';
export function validNoticeFile(bytes,type){if(bytes.length<10||bytes.length>20971520)return false;if(['pdf','pptx'].includes(type))return validLearningFile(bytes,type);if(type==='png')return bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.subarray(12,16).toString()==='IHDR';if(type==='jpg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;return false;}
export async function noticeUpload({db,body,userId,cohort,res}){
 const action=body.action;
 if(action==='attachment-upload'){
  let file;try{file=noticeFileInput(body);}catch(e){return res.status(400).json({error:e.message});}
  // Expired unsent drafts are cleaned on the next upload, after upload tickets have expired.
  const stale=await db.from('portal_notice_attachments').select('id,asset_path').eq('cohort_id',cohort).eq('created_by',userId).in('status',['pending','ready','expired']).lt('created_at',new Date(Date.now()-86400000).toISOString()).limit(10);
  if(stale.error)throw Error();for(const row of stale.data||[]){const claim=await db.from('portal_notice_attachments').update({status:'expired'}).eq('id',row.id).in('status',['pending','ready','expired']).lt('created_at',new Date(Date.now()-86400000).toISOString()).select('id').maybeSingle();if(claim.error)throw Error();if(!claim.data)continue;const f=await db.storage.from(noticeBucket).remove([row.asset_path]);if(!f.error)await db.from('portal_notice_attachments').delete().eq('id',row.id).eq('status','expired');}
  const id=randomUUID(),path=userId+'/'+cohort+'/notices/'+id+'.'+file.file_type;
  const saved=await db.from('portal_notice_attachments').insert({id,...file,cohort_id:cohort,created_by:userId,asset_path:path,status:'pending'});if(saved.error)throw Error();
  const signed=await db.storage.from(noticeBucket).createSignedUploadUrl(path);if(signed.error)throw Error();return res.status(200).json({id,path,token:signed.data.token,bucket:noticeBucket,contentType:noticeTypes[file.file_type]});
 }
 if(action!=='attachment-ready'||!noticeUUID(body.id))return res.status(400).json({error:'Anexo inválido.'});
 const r=await db.from('portal_notice_attachments').select('*').eq('id',body.id).eq('created_by',userId).eq('cohort_id',cohort).maybeSingle();if(r.error)throw Error();const row=r.data;if(!row||!['pending','ready'].includes(row.status))return res.status(404).json({error:'Anexo indisponível.'});
 const file=await db.storage.from(noticeBucket).download(row.asset_path);if(file.error)throw Error();const bytes=Buffer.from(await file.data.arrayBuffer());if(bytes.length!==row.byte_size||!validNoticeFile(bytes,row.file_type))return res.status(400).json({error:'O arquivo não corresponde ao formato ou tamanho informado. Selecione um arquivo válido.'});
 const updated=await db.from('portal_notice_attachments').update({status:'ready'}).eq('id',row.id).eq('status',row.status);if(updated.error)throw Error();return res.status(200).json({id:row.id,filename:row.filename,size:row.byte_size,ready:true});
}
