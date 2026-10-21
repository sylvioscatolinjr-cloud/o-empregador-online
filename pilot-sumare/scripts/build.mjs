import {mkdir,copyFile,cp,rm,readFile,writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
await Promise.all(['index.html','conta.html','assistente.html','home.css','logo.png','logo-web.webp','style.css','pagamentos.html','assinatura.html','blog.html','cursos-desejados.html','plataforma.html','editorial.html','instalar.html','offline.html','manifest.webmanifest','sw.js','icon-192.png','icon-512.png','icon-180.png'].map(name=>copyFile('app/'+name,'dist/'+name)));
await build({entryPoints:['app/app.mjs'],external:['/import/*'],outfile:'dist/app.js',bundle:true,format:'esm',platform:'browser',target:['es2022'],minify:true,legalComments:'eof'});
await build({entryPoints:['app/ai.mjs'],outfile:'dist/ai.js',bundle:true,format:'esm',platform:'browser',target:['es2022'],minify:true,legalComments:'eof'});
console.log('Piloto compilado. A ativação depende da configuração do projeto, e-mail e turma.');

await build({entryPoints:['app/billing.mjs'],outfile:'dist/billing.js',bundle:true,format:'esm',platform:'browser',target:['es2022'],minify:true,legalComments:'eof'});

await build({entryPoints:['app/community.mjs'],outfile:'dist/community.js',bundle:true,format:'esm',platform:'browser',target:['es2022'],minify:true,legalComments:'eof'});

await build({entryPoints:['app/home.mjs'],outfile:'dist/home.js',bundle:true,format:'esm',platform:'browser',target:['es2022'],minify:true,legalComments:'eof'});

// Legacy URL kept for old links and caches; pages use logo-web.webp (same alpha rule, ~85 KB, see scripts/logo-web.mjs).
// Preserve the approved bitmap and apply only a white-to-alpha filter in a self-contained SVG.
const approvedLogo=await readFile('app/logo.png');
await writeFile('dist/logo-transparent.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024"><defs><filter id="white-to-alpha" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -10 -10 -10 0 28"/></filter></defs><image width="1536" height="1024" href="data:image/png;base64,${approvedLogo.toString('base64')}" filter="url(#white-to-alpha)"/></svg>`);

await build({entryPoints:['app/editorial.mjs'],outfile:'dist/editorial.js',bundle:true,format:'esm',platform:'browser',target:['es2022'],minify:true,legalComments:'eof'});

await build({entryPoints:['app/pwa.mjs'],outfile:'dist/pwa.js',bundle:true,format:'esm',platform:'browser',target:['es2022'],minify:true,legalComments:'eof'});

await cp('app/import','dist/import',{recursive:true});

// Read-only production connection check. Never prints credentials or provider payloads.
if (process.env.VERCEL_ENV === 'production' && process.env.ASAAS_PRODUCTION_API_KEY) {
 const {productionBillingReadiness}=await import('../src/billing-production.mjs');
 const status=await productionBillingReadiness();
 console.log('ASAAS_PRODUCTION_CHECK '+JSON.stringify({connected:status.connected,accountStatus:status.accountStatus,billingReady:status.ready}));
}

await build({entryPoints:['app/subscriptions.mjs'],outfile:'dist/subscriptions.js',bundle:true,format:'esm',platform:'browser',target:['es2022'],minify:true,legalComments:'eof'});
if(process.env.VERCEL_ENV==='production'&&process.env.ASAAS_PRODUCTION_WEBHOOK_TOKEN){const {setupLiveBilling}=await import('./setup-live-billing.mjs');await setupLiveBilling();console.log('Configuração de cobrança real conferida.');}
