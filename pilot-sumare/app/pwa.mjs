export function setupAppInstall({win=window,doc=document,nav=navigator}={}){
 let deferred=null,busy=false;const status=text=>{const el=doc.querySelector('#install-status');if(el)el.textContent=text;};
 const installed=()=>win.matchMedia?.('(display-mode: standalone)').matches||nav.standalone===true;
 function labels(){if(installed())for(const link of doc.querySelectorAll('[data-install-app]')){link.textContent='Abrir meu espaço';link.setAttribute('href','/conta.html');}}
 win.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;status('Seu aparelho está pronto. Toque em Baixar app e confirme a instalação.');});
 win.addEventListener('appinstalled',()=>{deferred=null;status('App instalado! Procure O Empregador Online na tela inicial.');for(const link of doc.querySelectorAll('[data-install-app]')){link.textContent='App instalado — acessar';link.setAttribute('href','/conta.html');} });
 doc.addEventListener('click',async e=>{const button=e.target.closest('[data-install-app]');if(!button||installed()||button.getAttribute('href')==='/conta.html')return;if(deferred){e.preventDefault();if(busy)return;busy=true;const prompt=deferred;deferred=null;try{await prompt.prompt();const choice=await prompt.userChoice;status(choice.outcome==='accepted'?'Instalação solicitada. Confira a confirmação do navegador.':'Instalação não concluída. Você pode tentar pelo menu do navegador.');}catch{status('Use o menu do navegador e escolha Instalar aplicativo ou Adicionar à tela inicial.');}finally{busy=false;}}else if(win.location.pathname==='/instalar.html'){e.preventDefault();doc.querySelector('#instrucoes')?.focus();status('Siga as instruções abaixo para instalar no seu aparelho.');}});
 if('serviceWorker' in nav)nav.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).catch(()=>status('A instalação automática não ficou disponível agora. Siga as instruções abaixo ou tente novamente.'));
 labels();
}
if(typeof window!=='undefined')setupAppInstall();
