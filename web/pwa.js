(() => {
 const isPreview=new URLSearchParams(location.search).has('device-preview');
 let installPrompt=null;
 const standalone=()=>Boolean(window.matchMedia?.('(display-mode: standalone)').matches||window.navigator?.standalone);
 const installButton=document.getElementById('installApp');
 const previewButton=document.getElementById('devicePreview');
 const connection=document.getElementById('connectionStatus');
 if(isPreview)document.body.classList.add('device-preview');
 function syncInstall(){installButton.hidden=isPreview||standalone()}
 function syncConnection(){const offline=window.navigator?.onLine===false;connection.textContent=offline?'Sem conexão · aguarde para salvar':'';connection.classList.toggle('offline',offline)}
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;syncInstall()});
 window.addEventListener('appinstalled',()=>{installPrompt=null;installButton.hidden=true;toast('Aplicativo adicionado ao dispositivo.')});
 window.addEventListener('online',syncConnection);window.addEventListener('offline',syncConnection);
 syncInstall();syncConnection();
 installButton.addEventListener('click',async()=>{
  if(installPrompt){const prompt=installPrompt;installPrompt=null;try{await prompt.prompt();await prompt.userChoice}catch{showInstallHelp()}return}
  showInstallHelp();
 });
 function showInstallHelp(){
  document.getElementById('detailBody').innerHTML='<span class="pill teal">Na tela inicial</span><h2>Leve seu espaço com você</h2><p>Abra este link no navegador do seu celular para acessar a versão de teste. Não é necessária uma conta ChatGPT.</p><h3>Android · Chrome</h3><p>Toque no menu ⋮ e procure “Instalar aplicativo” ou “Adicionar à tela inicial”. Se o navegador oferecer a instalação, este botão também abrirá a confirmação.</p><h3>iPhone · Safari</h3><p>Toque em Compartilhar e depois em “Adicionar à Tela de Início”.</p><h3>No computador</h3><p>No Chrome ou Edge, procure o ícone de instalação na barra de endereço ou no menu do navegador.</p><div class="hint">Este protótipo está acessível pelo link e usa dados de teste salvos neste navegador. É preciso internet para carregar o portal. A instalação depende do navegador utilizado.</div>';
  document.getElementById('detail').showModal();
 }
 function enhanceMobileNavigation(){
  const sidebar=document.querySelector('.sidebar');
  if(sidebar){
   let toggle=sidebar.querySelector('.space-menu-toggle');
   if(!toggle){toggle=document.createElement('button');toggle.type='button';toggle.className='space-menu-toggle';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','spaceMenu');const menu=document.createElement('div');menu.id='spaceMenu';menu.className='space-menu-items';while(sidebar.firstChild)menu.appendChild(sidebar.firstChild);sidebar.append(toggle,menu)}
   const selected=sidebar.querySelector('.space-menu-items button.selected');
   const label='Áreas do Meu Espaço · '+(selected?.textContent.trim()||'Menu')+' ▾';
   if(toggle.textContent!==label)toggle.textContent=label;
  }
  document.querySelectorAll('.mobile-nav [data-page]').forEach(button=>{
   const active=button.dataset.page===page;button.classList.toggle('active',active);
   if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
 }
 document.addEventListener('click',event=>{
  const toggle=event.target.closest('.space-menu-toggle');
  if(toggle){const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.closest('.sidebar').classList.toggle('menu-open',open)}
  else if(event.target.closest('.space-menu-items button')){document.querySelector('.sidebar')?.classList.remove('menu-open');document.querySelector('.space-menu-toggle')?.setAttribute('aria-expanded','false')}
  enhanceMobileNavigation();
 });
 new MutationObserver(enhanceMobileNavigation).observe(document.getElementById('main'),{childList:true,subtree:true});
 enhanceMobileNavigation();
 previewButton.addEventListener('click',()=>{
  let dialog=document.getElementById('deviceDialog');
  if(!dialog){
   dialog=document.createElement('dialog');dialog.id='deviceDialog';dialog.className='device-dialog';dialog.setAttribute('aria-label','Prévia de responsividade');
   dialog.innerHTML='<div class="preview-heading"><div><span class="eyebrow">Prévia interativa</span><h2>Seu portal em outras telas</h2></div><button class="secondary" data-close-device>Fechar prévia ×</button></div><p class="meta">Escolha a largura. A prévia usa seu mesmo espaço de teste; alterações nos formulários também são salvas nele. Feche e recarregue a página principal para atualizar os dados.</p><div class="preview-sizes" role="group" aria-label="Largura da tela"><button class="secondary selected" data-device-width="390">Celular · 390 px</button><button class="secondary" data-device-width="360">Celular compacto · 360 px</button><button class="secondary" data-device-width="768">Tablet · 768 px</button></div><div class="device-stage"><iframe title="Portal responsivo" src="'+(location.pathname.startsWith('/laboratorio')?'/laboratorio/':'/')+'?device-preview=1" width="390" height="740"></iframe></div>';
   document.body.appendChild(dialog);
   dialog.querySelector('[data-close-device]').addEventListener('click',()=>dialog.close());
   dialog.querySelectorAll('[data-device-width]').forEach(button=>button.addEventListener('click',()=>{
    const width=button.dataset.deviceWidth;const frame=dialog.querySelector('iframe');frame.width=width;frame.style.width=width+'px';dialog.querySelectorAll('[data-device-width]').forEach(b=>b.classList.toggle('selected',b===button));
   }));
  }
  dialog.showModal();
 });
 if(!location.pathname.startsWith('/laboratorio')&&!isPreview&&window.isSecureContext&&'serviceWorker' in (window.navigator||{}))window.navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{installButton.title='Use o menu do navegador para adicionar à tela inicial.'});
})();
