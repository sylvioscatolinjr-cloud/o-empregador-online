// Built with an embedded ASSETS map. Hosted identity is injected by Sites dispatch.
const MAX_STATE=2*1024*1024,MAX_RESUME=5*1024*1024;
function reply(value,status=200,headers={}){return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',...headers}})}
function userOf(req){const id=req.headers.get('oai-authenticated-user-id'),email=req.headers.get('oai-authenticated-user-email');return id&&email?{id,email}:null}
function storageKey(user,suffix){return 'users/'+encodeURIComponent(user.id)+'/'+suffix}
async function readLimited(req,max){if(Number(req.headers.get('Content-Length'))>max)throw new Error('size');const chunks=[];let size=0;const reader=req.body?.getReader();if(!reader)return new Uint8Array();while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new Error('size')}chunks.push(value)}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}return bytes}
function validateState(s){if(!s||typeof s!=='object'||Array.isArray(s)||!['Candidato','Empresa','Instituição de Ensino'].includes(s.role)||!s.profile||typeof s.profile!=='object'||!Array.isArray(s.posts)||!Array.isArray(s.favorites)||!Array.isArray(s.applications))return false;if(!Object.values(s.profile).every(v=>v&&typeof v==='object'&&!Array.isArray(v))||!s.posts.every(p=>p&&typeof p==='object'&&typeof p.id==='string'))return false;const visit=(v)=>{if(!v||typeof v!=='object')return true;return Object.entries(v).every(([k,value])=>!/(password|senha|accountDocument|cpf|cnpj)/i.test(k)&&visit(value))};return visit(s)}
export default {async fetch(request,env){try{const url=new URL(request.url),path=url.pathname;if(!path.startsWith('/api/')){if(!['GET','HEAD'].includes(request.method))return new Response('Método não permitido',{status:405});const asset=ASSETS[path==='/'?'/index.html':path];if(!asset)return new Response('Página não encontrada',{status:404});const data=asset.base64?Uint8Array.from(atob(asset.body),c=>c.charCodeAt(0)):asset.body;return new Response(request.method==='HEAD'?null:data,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Robots-Tag':'noindex, nofollow'}})}
if(path==='/api/portal/asaas-webhook')return await portalAsaasWebhook(request,env);
const user=userOf(request);if(!user)return reply({error:'Entre pelo acesso autenticado do site.'},401);if(!env.BUCKET)return reply({error:'Armazenamento ainda não conectado.'},503);if(!['GET','HEAD'].includes(request.method)){if(request.headers.get('Origin')!==url.origin||request.headers.get('Sec-Fetch-Site')==='cross-site')return reply({error:'Origem não autorizada.'},403)}
const portalResponse=await portalAPI(request,env,path,user);if(portalResponse)return portalResponse;
if(path==='/api/state'){
 const key=storageKey(user,'state.json');
 if(request.method==='GET'){const object=await env.BUCKET.get(key);return reply({user,state:object?await object.json():null},200,object?{ETag:object.httpEtag}:{})}
 if(request.method!=='PUT')return reply({error:'Método não permitido.'},405);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply({error:'Formato inválido.'},415);
 let state;try{state=JSON.parse(new TextDecoder().decode(await readLimited(request,MAX_STATE)))}catch(e){return reply({error:e.message==='size'?'Dados excedem o limite.':'JSON inválido.'},e.message==='size'?413:400)}
 if(!validateState(state))return reply({error:'Estrutura inválida ou dados de credenciais não permitidos.'},400);
 const match=request.headers.get('If-Match');if(!match)return reply({error:'Versão dos dados obrigatória.'},428);
 const previous=await env.BUCKET.get(key);const previousState=previous?await previous.json():null;state=recordPortalDates(state,previousState);try{state=await resolvePublicationAddresses(env,state,previousState)}catch(error){return reply({error:error.message},error.status||503)}
 const conditional=new Headers(match==='new'?{'If-None-Match':'*'}:{'If-Match':match});
 const stored=await env.BUCKET.put(key,JSON.stringify(state),{onlyIf:conditional,httpMetadata:{contentType:'application/json',cacheControl:'private, no-store'}});
 if(!stored)return reply({error:'Conflito de versão. Recarregue antes de salvar.'},412);
 return reply({saved:true,metadata:portalSavedMetadata(state)},200,{ETag:stored.httpEtag});
}
if(path==='/api/resume'){
 const key=storageKey(user,'resume');
 if(request.method==='GET'){const object=await env.BUCKET.get(key);if(!object)return reply({error:'Currículo não encontrado.'},404);const name=object.customMetadata?.name||'curriculo.pdf';return new Response(object.body,{headers:{'Content-Type':object.httpMetadata?.contentType||'application/octet-stream','Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(name),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}
 if(request.method!=='PUT')return reply({error:'Método não permitido.'},405);
 let name;try{name=decodeURIComponent(request.headers.get('X-File-Name')||'')}catch{return reply({error:'Nome inválido.'},400)}name=name.replace(/[\r\n/\\]/g,'_').slice(0,180);
 if(!/\.(pdf|docx)$/i.test(name))return reply({error:'Escolha PDF ou DOCX.'},415);
 let bytes;try{bytes=await readLimited(request,MAX_RESUME)}catch{return reply({error:'Limite de 5 MB.'},413)}
 const pdf=new TextDecoder().decode(bytes.slice(0,5))==='%PDF-',docx=bytes[0]===80&&bytes[1]===75&&bytes[2]===3&&bytes[3]===4;
 if(!bytes.length||(/\.pdf$/i.test(name)?!pdf:!docx))return reply({error:'O conteúdo não corresponde ao formato do arquivo.'},415);
 const type=/\.pdf$/i.test(name)?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
 const stored=await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:type,cacheControl:'private, no-store'},customMetadata:{name}});
 return reply({name,size:bytes.length,uploadedAt:new Date().toISOString(),etag:stored.etag});
}
return reply({error:'Endpoint não encontrado.'},404);
}catch{return reply({error:'Não foi possível concluir a operação. Tente novamente.'},500)}}};
