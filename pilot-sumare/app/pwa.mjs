export function setupAppInstall({win=window,doc=document,nav=navigator}={}){
 let deferred=null,busy=false,completed=false;
 const mode=win.matchMedia?.('(display-mode: standalone)');
 const installed=()=>completed||mode?.matches||nav.standalone===true;
 const status=text=>{const el=doc.querySelector('#install-status');if(el)el.textContent=text;};
 const ua=nav.userAgent||'';
 const ios=/iPad|iPhone|iPod/i.test(ua)||/Macintosh/i.test(ua)&&nav.maxTouchPoints>1;
 const manual='O navegador não disponibilizou a instalação direta pelo botão do site. '+(ios?'No Safari: Compartilhar → Adicionar à Tela de Início → Adicionar.':'No Chrome Android: menu ⋮ → Instalar e criar atalho → Instalar. Também pode aparecer Adicionar à tela inicial.');
 function render(){
  for(const control of doc.querySelectorAll('[data-install-app]')){
   if(control.hasAttribute('data-native-install')){control.hidden=false;control.disabled=busy||!deferred&&!installed();}
   if(installed()){control.textContent='App instalado — acessar';if(control.tagName==='A')control.setAttribute('href','/conta.html');}
   else if(deferred)control.textContent='Instalar app neste aparelho';
   else control.textContent=control.hasAttribute('data-native-install')?'Instalação direta indisponível':'Como instalar o app';
  }
 }
 function guide(platform){for(const el of doc.querySelectorAll('[data-install-platform]'))el.hidden=el.dataset.installPlatform!==platform;}
 if(ios)guide('ios');else if(/Android/i.test(ua))guide('android');
 win.addEventListener('beforeinstallprompt',e=>{e.preventDefault();if(installed())return;deferred=e;render();status('Instalação disponível. Toque em Instalar app neste aparelho e confirme na janela do navegador.');});
 win.addEventListener('appinstalled',()=>{completed=true;deferred=null;render();status('App instalado! Procure O Empregador Online na tela inicial.');});
 mode?.addEventListener?.('change',()=>{render();if(installed())status('Você já está usando o app instalado.');});
 doc.addEventListener('click',async e=>{
  const copy=e.target.closest('[data-copy-install-url]');if(copy){e.preventDefault();const field=doc.querySelector('#install-url');try{if(!nav.clipboard?.writeText)throw Error();await nav.clipboard.writeText(field.value);status('Endereço copiado. Abra o Chrome no Android ou Safari no iPhone e cole na barra de endereço.');}catch{field?.focus?.();field?.select?.();status('Copie o endereço do campo acima e abra no Chrome ou Safari do aparelho.');}return;}
  const control=e.target.closest('[data-install-app]');if(!control)return;
  if(installed()){if(control.tagName!=='A'){e.preventDefault();win.location.assign('/conta.html');}return;}
  if(busy){e.preventDefault();return;}
  if(deferred){e.preventDefault();busy=true;const prompt=deferred;deferred=null;render();try{await prompt.prompt();const choice=await prompt.userChoice;if(!installed())status(choice.outcome==='accepted'?'Instalação solicitada. Aguarde a confirmação do navegador.':'Instalação não concluída. '+manual);}catch{if(!installed())status('A janela de instalação não abriu. '+manual);}finally{busy=false;render();}}
  else if(win.location.pathname==='/instalar.html'){e.preventDefault();status(manual);}
 });
 if('serviceWorker' in nav)nav.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).catch(()=>{if(!deferred&&!installed())status('A instalação automática não ficou disponível agora. '+manual);});
 render();
 if(doc.querySelector('#install-status'))status(installed()?'Você já está usando o app instalado.':manual);
}
if(typeof window!=='undefined')setupAppInstall();
