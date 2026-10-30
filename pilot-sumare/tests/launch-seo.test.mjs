import test from 'node:test';import assert from 'node:assert/strict';import {readFile,readdir} from 'node:fs/promises';import vm from 'node:vm';import {createRequire} from 'node:module';
import {highlightAttributes} from '../app/highlight-metrics-draft.mjs';import {benefitList} from '../src/subscriber-benefits.mjs';import {alternateDemoCards} from '../app/highlight-order.mjs';import {cardIdentity} from '../app/card-identity.mjs';
const require=createRequire(import.meta.url),{parseHTML}=require('linkedom');
const read=f=>readFile(new URL('../'+f,import.meta.url),'utf8');
const PUBLIC=['index.html','blog.html','instalar.html'];

test('somente as páginas públicas liberadas ficam indexáveis; contas, áreas logadas e textos legais preliminares seguem fora da busca',async()=>{
 const vercel=JSON.parse(await read('vercel.json'));
 assert(!vercel.headers.find(h=>h.source==='/(.*)').headers.some(h=>h.key==='X-Robots-Tag'),'cabeçalho global noindex removido');
 const rule=vercel.headers.find(h=>h.headers.some(x=>x.key==='X-Robots-Tag'));const re=new RegExp('^'+rule.source+'$');
 for(const path of ['/','/index.html','/blog.html','/instalar.html','/robots.txt','/sitemap.xml','/og-image.png'])assert(!re.test(path),path);
 for(const path of ['/conta.html','/assistente.html','/carteira.html','/privacidade.html','/termos.html','/api/ai','/pagamentos.html','/qualquer'])assert(re.test(path),path);
 for(const file of (await readdir(new URL('../app/',import.meta.url))).filter(f=>f.endsWith('.html'))){
  const html=await read('app/'+file);
  if(PUBLIC.includes(file)){assert.doesNotMatch(html,/name="robots"/,file);assert.match(html,/<link rel="canonical" href="https:\/\/www\.oempregadoronline\.com\.br\//,file);assert.match(html,/property="og:image" content="https:\/\/www\.oempregadoronline\.com\.br\/og-image\.png"/,file);assert.match(html,/name="description"/,file);}
  else if(!['offline.html','revisao-interface.html'].includes(file))assert.match(html,/name="robots" content="noindex/,file);
  assert.match(html,/rel="icon" href="\/favicon\.ico"/,file);
 }
});

test('robots.txt e sitemap apontam só para o domínio oficial e as páginas públicas',async()=>{
 const robots=await read('app/robots.txt'),build=await read('scripts/build.mjs');
 assert.match(robots,/^Disallow: \/api\/$/m);assert.match(robots,/^Sitemap: https:\/\/www\.oempregadoronline\.com\.br\/sitemap\.xml$/m);
 assert.match(build,/INDEXABLE_PAGES=\['\/','\/blog\.html','\/instalar\.html'\]/);
 for(const f of ['404.html','robots.txt','favicon.ico','og-image.png','logo-header.webp'])assert.match(build,new RegExp("'"+f.replace('.','\\.')+"'"),f);
});

test('vitrine fica fora dos trechos do Google e a home não mostra mais o aviso de testes',async()=>{
 const {document}=parseHTML(await read('app/index.html'));
 for(const id of ['jobs-grid','courses-grid','candidates-grid'])assert(document.getElementById(id).hasAttribute('data-nosnippet'),id);
 assert.doesNotMatch(document.body.textContent,/está em testes|aguardam ativação/);
 assert(document.querySelector('dialog#listing-preview'));
});

test('404 em português, com logo e caminho de volta; páginas internas mostram a logo',async()=>{
 const {document}=parseHTML(await read('app/404.html'));
 assert.equal(document.documentElement.getAttribute('lang'),'pt-BR');assert.match(document.querySelector('h1').textContent,/Página não encontrada/);
 assert(document.querySelector('header .brand img[src="/logo-header.webp"]'));assert(document.querySelector('main a[href="/"]'));
 for(const file of ['conta.html','blog.html','assinatura.html','privacidade.html','termos.html','instalar.html','cursos-desejados.html'])assert.match(await read('app/'+file),/<header><a class="brand" href="\/"[^>]*><img src="\/logo-header\.webp"/,file);
 for(const file of ['blog.html','cursos-desejados.html','instalar.html'])assert.match(await read('app/'+file),/legal-footer"><a href="\/termos\.html">/,file);
});

test('quem chega por link compartilhado vê a prévia da vaga sem login e só entra para se candidatar',async()=>{
 const html=await read('app/index.html'),source=(await read('app/home.mjs')).replace(/^import .*;\n/gm,'');const {document}=parseHTML(html),replaced=[];
 const id='11111111-2222-3333-4444-555555555555',item={id,kind:'job',is_fictitious:false,is_featured:false,title:'Desenhista Projetista Pleno',organization:'Empresa real',description:'Descrição completa da vaga.',city:'Campinas',state_code:'SP',modality:'Presencial',job_type:'CLT',logo_data:''};
 const client={auth:{async getSession(){return {data:{session:null}}}}};
 const context={highlightAttributes,benefitList,alternateDemoCards,cardIdentity,mountHighlightCarousel:()=>()=>{},document,location:{href:'https://portal.example/?anuncio='+id,origin:'https://portal.example',replace:u=>replaced.push(u)},URL,FormData,Response,createClient:()=>client,fetch:async url=>url.startsWith('/api/config')?Response.json({supabaseURL:'https://fixture.supabase.co',publishableKey:'fixture'}):Response.json({items:new URL(url,'https://portal.example').searchParams.get('kind')==='job'?[item]:[]})};
 vm.createContext(context);vm.runInContext(source,context);await new Promise(r=>setTimeout(r,30));
 assert.deepEqual(replaced,[]);const dialog=document.getElementById('listing-preview');
 assert.match(dialog.textContent,/Desenhista Projetista Pleno/);assert.match(dialog.textContent,/Descrição completa da vaga/);
 assert(dialog.querySelector(`a[href="/conta.html?anuncio=${id}"]`));assert.match(dialog.textContent,/Entrar para se candidatar/);assert(dialog.querySelector('a[href^="/conta.html?cadastro=1"]'));
});

test('anúncio compartilhado que não está na vitrine continua indo para a conta',async()=>{
 const html=await read('app/index.html'),source=(await read('app/home.mjs')).replace(/^import .*;\n/gm,'');const {document}=parseHTML(html),replaced=[];const id='99999999-2222-3333-4444-555555555555';
 const context={highlightAttributes,benefitList,alternateDemoCards,cardIdentity,mountHighlightCarousel:()=>()=>{},document,location:{href:'https://portal.example/?anuncio='+id,origin:'https://portal.example',replace:u=>replaced.push(u)},URL,FormData,Response,createClient:()=>({auth:{async getSession(){return {data:{session:null}}}}}),fetch:async url=>url.startsWith('/api/config')?Response.json({supabaseURL:'https://x.supabase.co',publishableKey:'x'}):Response.json({items:[]})};
 vm.createContext(context);vm.runInContext(source,context);await new Promise(r=>setTimeout(r,30));
 assert.deepEqual(replaced,['/conta.html?anuncio='+id]);
});
