import test from 'node:test';import assert from 'node:assert/strict';import {parseHTML} from 'linkedom';import {mountCreditWallet} from '../app/credit-wallet.mjs';
const tick=()=>new Promise(r=>setTimeout(r,10));
async function fixture({ready=true,current=true,fail=false}={}){
 const {window}=parseHTML('<section id="wallet"></section>'),root=window.document.querySelector('section'),calls=[],paths=[];
 const api=async(action,method='GET',body)=>{calls.push({action,method,body});if(method==='POST'){if(fail)throw Error('Recarga pendente. Não repita.');return {url:'https://asaas.com/checkoutSession/show?id=fixture',message:'Conferência concluída'};}return {ready,amounts:[1000,2500,5000],termsVersion:'fixture',availableCents:1000,availableCalls:10,subscriptionCents:0,purchasedCents:1000,orders:[{id:'fixture',cents:1000,status:'pending',created_at:'2026-10-23',url:'https://asaas.com/checkoutSession/show?id=fixture'}]};};
 await mountCreditWallet(root,{api,isCurrent:()=>current,navigate:p=>paths.push(p)}).show();return {window,root,calls,paths};
}
test('wallet shows fixed amounts and no recurring purchase; a selection alone creates no charge',async()=>{const f=await fixture();assert.equal(f.root.querySelectorAll('option').length,3);assert.match(f.root.textContent,/sem assinatura, mudança de plano ou renovação automática/i);assert.equal(f.calls.length,1);assert(f.root.querySelector('a.portal-action[href="/assistente.html"]'));assert.equal(f.paths.length,0);});
test('explicit purchase clears password and redirects only after checkout response; failures stay visible',async()=>{
 for(const fail of [false,true]){const f=await fixture({fail}),form=f.root.querySelector('form');form.querySelector('[name=password]').value='synthetic';form.querySelector('[name=accept]').checked=true;form.dispatchEvent(new f.window.Event('submit',{bubbles:true,cancelable:true}));await tick();assert.equal(form.querySelector('[name=password]').value,'');assert.equal(f.calls.filter(c=>c.method==='POST').length,1);assert.equal(f.paths.length,fail?0:1);if(fail)assert.match(f.root.querySelector('[data-wallet-status]').textContent,/Não repita/);}
});
test('unready checkout remains disabled and stale account cannot render wallet details',async()=>{assert((await fixture({ready:false})).root.querySelector('form button').disabled);assert.equal((await fixture({current:false})).root.textContent,'');});
