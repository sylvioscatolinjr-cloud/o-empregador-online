import {createClient} from '@supabase/supabase-js';
import {noticeUpload} from './notice-upload.mjs';
import {noticeLink,noticeUUID,noticeBucket} from './notice-material.mjs';
export function campaignHandler({env=process.env,clientFactory=createClient}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Método inválido.'});
 if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID)return res.status(503).json({error:'Turbinar indisponível.'});
 const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];
 if(!token)return res.status(401).json({error:'Entre na sua conta.'});
 if(req.method==='POST'&&(req.headers.origin!==env.APP_ORIGIN||req.headers['sec-fetch-site']==='cross-site'))return res.status(403).json({error:'Origem inválida.'});
 if(req.method==='POST'&&(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>16000))return res.status(400).json({error:'Formato inválido.'});
 try{
 const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const auth=await db.auth.getUser(token),user=auth.data?.user;
 if(auth.error||!user?.email_confirmed_at||user.banned_until&&Date.parse(user.banned_until)>Date.now())return res.status(401).json({error:'Entre com e-mail confirmado.'});
 const co=env.PILOT_COHORT_ID,m=await db.from('pilot_memberships').select('role,status,is_fictitious,age_band').eq('user_id',user.id).eq('cohort_id',co).maybeSingle();
 if(m.error)throw Error();if(m.data?.status!=='active'||m.data?.is_fictitious)return res.status(403).json({error:'Acesso não autorizado.'});
 const publisher=['recruiter','school_staff','pilot_owner'].includes(m.data.role),owner=m.data.role==='pilot_owner';
 const rpc=async(name,args)=>{const r=await db.rpc(name,args);if(r.error){const message=r.error.message||'';const known=/campaign expired|quote expired|invalid campaign state|approval required|insufficient|daily limit|1000|adult campaigns|invalid campaign attachment|listing unavailable/.test(message);throw Object.assign(Error(known?'Campanha indisponível ou alterada. Confira validade, público, saldo e aprovação; atualize antes de tentar novamente.':'Não foi possível concluir. Atualize o histórico antes de repetir.'),{http:409});}return r.data;};
 const args={p_user:user.id,p_cohort:co},b=req.body||{};
 if(req.method==='GET'){
 if(req.query?.view==='file'){
 if(!noticeUUID(req.query.id))return res.status(400).json({error:'Campanha inválida.'});
 let q=db.from('portal_campaigns').select('attachment_id').eq('id',req.query.id).eq('cohort_id',co);if(!owner)q=q.eq('user_id',user.id);
 const c=await q.maybeSingle();if(c.error)throw Error();if(!c.data?.attachment_id)return res.status(404).json({error:'Anexo não encontrado.'});
 const a=await db.from('portal_notice_attachments').select('asset_path,filename').eq('id',c.data.attachment_id).eq('cohort_id',co).eq('status','used').maybeSingle();if(a.error||!a.data)throw Error();
 const link=await db.storage.from(noticeBucket).createSignedUrl(a.data.asset_path,60,{download:a.data.filename});if(link.error)throw Error();return res.status(200).json({url:link.data.signedUrl});
 }
 const pref=await db.from('portal_campaign_preferences').select('enabled,topics').eq('user_id',user.id).eq('cohort_id',co).maybeSingle();if(pref.error)throw Error();
 let campaigns=[];let listings=[];let balance={purchasedCents:0,held:false};
 if(publisher){
 let q=db.from('portal_campaigns').select('id,user_id,listing_id,title,body,access_url,attachment_id,filters,status,quoted_count,quoted_cents,charged_cents,created_at,expires_at,reason,sent_at').eq('cohort_id',co).order('created_at',{ascending:false}).limit(50);if(!owner)q=q.eq('user_id',user.id);
 const c=await q;if(c.error)throw Error();
 campaigns=await Promise.all(c.data.map(async row=>{const cr=await db.from('portal_campaign_recipients').select('notification_id').eq('campaign_id',row.id).not('notification_id','is',null);if(cr.error)throw Error();const ids=cr.data.map(x=>x.notification_id);let reads=0;for(let i=0;i<ids.length;i+=100){const n=await db.from('portal_notifications').select('id',{count:'exact',head:true}).in('id',ids.slice(i,i+100)).not('read_at','is',null);if(n.error)throw Error();reads+=n.count||0;}const org=await db.from('portal_organizations').select('name').eq('user_id',row.user_id).eq('cohort_id',co).maybeSingle();if(org.error)throw Error();const {user_id,...safe}=row;return {...safe,publisherName:org.data?.name||'O Empregador Online / organização não informada',own:user_id===user.id,delivered:ids.length,read:reads};}));
 const l=await db.from('portal_listings').select('id,title,kind').eq('publisher_id',user.id).eq('cohort_id',co).eq('status','published').eq('is_fictitious',false).limit(200);if(l.error)throw Error();listings=l.data;
 balance=await rpc('portal_ai_wallet_balance',args);
 }
 return res.status(200).json({role:m.data.role,adult:m.data.age_band==='18_plus',publisher,owner,preference:pref.data||{enabled:false,topics:[]},campaigns,listings,purchasedCents:balance.held?0:balance.purchasedCents,held:balance.held,unitCents:5,termsVersion:'2026-10-28-turbinar-v1'});
 }
 if(b.action==='preference'){
 if(typeof b.enabled!=='boolean'||!Array.isArray(b.topics)||b.enabled&&b.accept!==true)return res.status(400).json({error:'Confirme sua autorização de campanhas.'});
 await rpc('portal_campaign_preference',{...args,p_enabled:b.enabled,p_topics:b.topics});return res.status(200).json({message:'Preferência salva. Desativar impede novos envios; avisos administrativos continuam separados.'});
 }
 if(!publisher)return res.status(403).json({error:'Campanhas disponíveis para empresa e instituição.'});
 if(b.action==='attachment-upload'&&(!/\.(png|jpe?g|pdf)$/i.test(b.filename||'')||!Number.isInteger(b.size)||b.size>3145728))return res.status(400).json({error:'Use PNG, JPG ou PDF de até 3 MB.'});
 if(['attachment-upload','attachment-ready'].includes(b.action))return await noticeUpload({db,body:b,userId:user.id,cohort:co,res});
 if(b.action==='quote'){
 if(b.rights!==true)return res.status(400).json({error:'Confirme autorização do conteúdo.'});
 let access_url;try{access_url=noticeLink(b.access_url);}catch(e){return res.status(400).json({error:e.message});}
 const id=await rpc('portal_campaign_quote',{...args,p_content:{title:String(b.title||''),body:String(b.body||''),access_url,listing_id:b.listing_id||null,attachment_id:b.attachment_id||null,filters:b.filters}});
 return res.status(200).json({id,message:'Prévia salva por 15 minutos. Confira o orçamento e solicite aprovação.'});
 }
 if(!noticeUUID(b.id)||!['submit','approve','reject','send','cancel'].includes(b.action))return res.status(400).json({error:'Ação inválida.'});
 if(['submit','send'].includes(b.action)&&(b.accept!==true||b.termsVersion!=='2026-10-28-turbinar-v1'))return res.status(400).json({error:'Confirme orçamento e Termos antes de enviar.'});
 if(['approve','reject'].includes(b.action)&&!owner)return res.status(403).json({error:'Aprovação exclusiva do proprietário.'});
 const result=await rpc('portal_campaign_action',{...args,p_id:b.id,p_action:b.action,p_reason:String(b.reason||''),p_cents:Number.isSafeInteger(b.cents)?b.cents:null});
 return res.status(200).json(result);
 }catch(e){return res.status(e.http||503).json({error:e.http?e.message:'Turbinar temporariamente indisponível. Consulte o histórico antes de repetir.'});}
};}
export default campaignHandler();
