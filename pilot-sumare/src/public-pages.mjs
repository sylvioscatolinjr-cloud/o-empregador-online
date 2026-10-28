// Public, indexable pages: sitemap and one page per published listing (/vaga/<id>).
// Termos e Política ficam fora do índice enquanto forem versão preliminar.
// Only data already shown in the public feed is used. Candidates are never listed here.
import {createClient} from '@supabase/supabase-js';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const STATIC_PAGES=['/','/blog.html'];
const EMPLOYMENT={'CLT':'FULL_TIME','PJ':'CONTRACTOR','MEI':'CONTRACTOR','Autônomo/Freelancer':'CONTRACTOR','Estágio':'INTERN','Jovem Aprendiz':'INTERN','Temporário':'TEMPORARY','Intermitente':'PER_DIEM'};
const kindLabel=l=>l.kind==='job'?l.job_type||'Vaga':l.kind==='course'?'Curso com certificado':'Treinamento';

export function sitemapXML(origin,listings=[]){
 const urls=[...STATIC_PAGES.map(p=>({loc:origin+p})),...listings.filter(l=>!l.is_fictitious&&uuid.test(l.id)).map(l=>({loc:origin+'/vaga/'+l.id,lastmod:String(l.created_at||'').slice(0,10)}))];
 return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>`<url><loc>${esc(u.loc)}</loc>${/^\d{4}-\d{2}-\d{2}$/.test(u.lastmod||'')?`<lastmod>${u.lastmod}</lastmod>`:''}</url>`).join('\n')+'\n</urlset>\n';
}

// Google JobPosting for jobs; Course for courses and trainings.
export function structuredData(l,origin){
 const url=origin+'/vaga/'+l.id,description=[l.description,l.required_requirements&&'Requisitos: '+l.required_requirements,l.desired_requirements&&'Desejável: '+l.desired_requirements,l.benefits&&'Oferecemos: '+l.benefits,l.salary&&'Salário: '+l.salary].filter(Boolean).join('\n\n');
 if(l.kind!=='job')return {'@context':'https://schema.org','@type':'Course',name:l.title,description,url,provider:{'@type':'Organization',name:l.organization}};
 const data={'@context':'https://schema.org','@type':'JobPosting',title:l.title,description,datePosted:String(l.created_at||'').slice(0,10),url,hiringOrganization:{'@type':'Organization',name:l.organization},directApply:true,employmentType:EMPLOYMENT[l.job_type]||'OTHER',jobLocation:{'@type':'Place',address:{'@type':'PostalAddress',addressLocality:l.city,addressRegion:l.state_code,addressCountry:'BR'}}};
 if(l.modality==='Online'){data.jobLocationType='TELECOMMUTE';data.applicantLocationRequirements={'@type':'Country',name:'Brasil'};}
 return data;
}

export function listingPage(l,origin){
 const title=`${l.title} — ${l.organization}`,summary=String(l.description||'').replace(/\s+/g,' ').slice(0,155);
 const block=(label,value)=>value?`<h2>${esc(label)}</h2><p class="listing-text">${esc(value)}</p>`:'';
 // JSON-LD is a data block, not executed script; "<" is escaped so content cannot close the tag.
 const ld=JSON.stringify(structuredData(l,origin)).replace(/</g,'\\u003c');
 return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="${l.is_fictitious?'noindex,nofollow':'index,follow'}"><title>${esc(title)} | O Empregador Online</title><meta name="description" content="${esc(summary)}"><link rel="canonical" href="${esc(origin+'/vaga/'+l.id)}"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/home.css"><link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#543878"><style>.listing-page{max-width:820px;margin:0 auto;padding:24px 5% 64px}.listing-text{white-space:pre-line}</style>${l.is_fictitious?'':`<script type="application/ld+json">${ld}</script>`}</head>
<body class="public-home"><header class="public-header"><a class="brand" href="/" aria-label="O Empregador Online — início"><img src="/logo-web.webp" width="1536" height="1024" alt="O Empregador Online"></a><div class="auth-actions"><a href="/conta.html">Entrar</a><a class="button primary" href="/conta.html?cadastro=1">Cadastrar</a></div></header>
<main class="listing-page"><p class="tag">${esc(kindLabel(l))}</p>${l.is_fictitious?'<p class="tag">Anúncio de demonstração</p>':''}<h1>${esc(l.title)}</h1><p class="organization">${esc(l.organization)}</p><p>${esc(l.city)}/${esc(l.state_code)} · ${esc(l.modality)}</p>
${block('Descrição',l.description)}${block('Requisitos',l.required_requirements)}${block('Desejável',l.desired_requirements)}${block('Perfil comportamental',l.behavioral_profile)}${block('Oferecemos',l.benefits)}${block('Salário',l.salary)}
<div class="actions"><a class="portal-action button primary" href="/conta.html?anuncio=${esc(l.id)}">${l.kind==='job'?'Candidatar-se':'Quero participar'}</a><a class="portal-action" href="/">Ver outras oportunidades</a></div>
<p class="hint">Para se candidatar, entre ou crie sua conta gratuita. O O Empregador Online nunca cobra do candidato para participar de processos seletivos.</p></main>
<footer><a href="/blog.html">Blog</a><a href="/termos.html">Termos de Uso</a><a href="/privacidade.html">Política de Privacidade</a></footer></body></html>`;
}

function notFound(res){res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('X-Robots-Tag','noindex');res.setHeader('Cache-Control','public, max-age=60, s-maxage=300');return res.status(404).send('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Oportunidade encerrada | O Empregador Online</title><link rel="stylesheet" href="/style.css"></head><body><main class="listing-page"><h1>Esta oportunidade não está mais disponível</h1><p>Ela pode ter sido encerrada pela empresa ou instituição.</p><p><a class="portal-action" href="/">Ver oportunidades abertas</a></p></main></body></html>');}

export function publicPagesHandler({env=process.env,clientFactory=createClient}={}){return async(req,res)=>{
 if(req.method!=='GET'&&req.method!=='HEAD')return res.status(405).json({error:'Método inválido.'});
 const origin=env.APP_ORIGIN;
 if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY||!env.PILOT_COHORT_ID||!origin){res.setHeader('Cache-Control','no-store');return res.status(503).send('Página em configuração.');}
 const db=clientFactory(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 try{
  if(req.query?.action==='sitemap'){
   const listings=[];for(let page=0;page<100;page++){const r=await db.rpc('portal_ordered_public_feed',{p_cohort:env.PILOT_COHORT_ID,p_kind:'all',p_query:'',p_page:page,p_size:50});if(r.error)throw Error();const items=r.data||[];listings.push(...items.map(({id,created_at,is_fictitious})=>({id,created_at,is_fictitious})));if(items.length<50)break;}
   res.setHeader('Content-Type','application/xml; charset=utf-8');res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600');return res.status(200).send(sitemapXML(origin,listings));
  }
  const id=String(req.query?.id||'');if(!uuid.test(id))return notFound(res);
  const r=await db.from('portal_listings').select('*').eq('id',id).eq('cohort_id',env.PILOT_COHORT_ID).eq('status','published').maybeSingle();if(r.error)throw Error();const l=r.data;if(!l)return notFound(res);
  // Same publisher rules as the public feed: active organization, jobs only from companies, confirmed e-mail, not banned.
  const m=await db.from('pilot_memberships').select('role,status,is_fictitious').eq('user_id',l.publisher_id).eq('cohort_id',env.PILOT_COHORT_ID).maybeSingle();if(m.error)throw Error();
  if(m.data?.status!=='active'||!['recruiter','school_staff'].includes(m.data.role)||l.kind==='job'&&m.data.role!=='recruiter')return notFound(res);
  if(!(l.is_fictitious&&m.data.is_fictitious)){const u=await db.auth.admin.getUserById(l.publisher_id);const user=u.data?.user;if(u.error||!user?.email_confirmed_at||user.banned_until&&Date.parse(user.banned_until)>Date.now())return notFound(res);}
  const {publisher_id,postal_code,address,cohort_id,logo_data,...safe}=l;
  res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','public, max-age=0, s-maxage=600');if(l.is_fictitious)res.setHeader('X-Robots-Tag','noindex');
  return res.status(200).send(listingPage(safe,origin));
 }catch{res.setHeader('Cache-Control','no-store');return res.status(503).send('Não foi possível carregar a página. Tente novamente.');}
};}
