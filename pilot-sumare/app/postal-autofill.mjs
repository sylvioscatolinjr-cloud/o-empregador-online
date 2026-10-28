export function attachPostalAutofill(root,{fetcher=fetch}={}){
 const revisions=new WeakMap();
 root.addEventListener('input',async event=>{
  const input=event.target,form=input.closest?.('form');if(!form||input.name!=='postal_code')return;
  const version=(revisions.get(input)||0)+1;revisions.set(input,version);
  const postal=input.value.replace(/\D/g,'');if(postal.length!==8)return;
  const names=['address','city','state_code'],fields=names.map(n=>form.querySelector(`[name="${n}"]`)),before=fields.map(f=>f?.value);
  let status=form.querySelector('[data-postal-status]');if(!status){status=document.createElement('p');status.dataset.postalStatus='';status.setAttribute('role','status');input.closest('label').after(status);}status.textContent='Consultando CEP…';
  try{const response=await fetcher('/api/config?postal='+postal,{cache:'no-store'});if(!response.ok)throw Error();const data=await response.json();if(!form.isConnected||revisions.get(input)!==version)return;
   fields.forEach((field,i)=>{if(field&&field.value===before[i]&&data[names[i]]){field.value=data[names[i]];field.dispatchEvent(new Event('input',{bubbles:true}));}});status.textContent='Endereço consultado. Confira os dados e complete número e complemento, se necessário.';
  }catch{if(form.isConnected&&revisions.get(input)===version)status.textContent='CEP não encontrado ou consulta indisponível. Preencha o endereço manualmente.';}
 });
}
