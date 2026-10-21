import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
const source=(await readFile(new URL('../app/ai.mjs',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
const tick=()=>new Promise(resolve=>setTimeout(resolve,10));
function fixture({signedIn=true,balanceFailure=false,chatFailure=false,pendingChat=false}={}){
 const {window}=parseHTML('<section id="ai-app"></section>');let session=signedIn?{user:{id:'fixture'},access_token:'session.token'}:null;let balanceReads=0;const calls=[],payloads=[];let authListener,resolveChat;
 const cfg={supabaseURL:'https://fixture.supabase.co',publishableKey:'sb_publishable_fixture',origin:'https://preview.example'};
 const auth={onAuthStateChange(fn){authListener=fn;return {data:{subscription:{unsubscribe(){}}}};},async getSession(){return {data:{session}};},async signInWithPassword(){session={user:{id:'fixture'},access_token:'session.token'};return {error:null};},async signOut(){session=null;return {error:null};}};
 const fetch=async(url,options={})=>{
  if(url==='/api/config')return Response.json({ready:false,aiPreview:cfg});
  const action=new URL(url,cfg.origin).searchParams.get('action');calls.push(action);if(options.body)payloads.push(JSON.parse(options.body));
  if(action==='catalog')return Response.json({agent:{title:'Agente de teste',mission:'Teste'},tasks:[{id:'resume_review',label:'Revisar currículo',hint:'Texto',available:true,minTier:1,costCents:100}]});
  if(action==='chat'&&pendingChat)return new Promise(resolve=>{resolveChat=()=>resolve(Response.json({answer:'Resposta privada anterior'}));});
  if(action==='chat')return chatFailure?Response.json({error:'Créditos insuficientes'},{status:402}):Response.json({answer:'<script>texto não executável</script>'});
  if(action==='balance'){balanceReads++;if(balanceFailure&&balanceReads>1)throw Error('network');return Response.json({active:true,availableCalls:balanceReads===1?1:0});}
 };
 const context={document:window.document,location:{origin:cfg.origin},createClient:()=>({auth}),fetch,Response};vm.createContext(context);vm.runInContext(source,context);
 return {window,calls,payloads,root:window.document.querySelector('#ai-app'),switchAccount(notify=true){session={user:{id:'other'},access_token:'other.token'};if(notify)authListener?.('SIGNED_IN',session);},expire(){session=null;authListener?.('SIGNED_OUT',null);},finishChat(){resolveChat();}};
}
test('preview login accepts existing session, renders response as text and disables exhausted balance',async()=>{
 const f=fixture();await tick();f.root.querySelector('[data-task]').click();const form=f.root.querySelector('#ai-form');form.querySelector('textarea').value='Pergunta';form.dispatchEvent(new f.window.Event('submit'));form.dispatchEvent(new f.window.Event('submit'));await tick();
 assert.equal(f.calls.filter(x=>x==='chat').length,1);assert.equal(f.root.querySelector('#ai-answer script'),null);assert.match(f.root.querySelector('#ai-answer').textContent,/script/);assert.equal(form.querySelector('button').disabled,true);assert.match(f.root.querySelector('#ai-status').textContent,/Saldo: 0/);
});
test('failed credit request refreshes balance before allowing another send',async()=>{
 const f=fixture({chatFailure:true});await tick();f.root.querySelector('[data-task]').click();const form=f.root.querySelector('#ai-form');form.querySelector('textarea').value='Pergunta';form.dispatchEvent(new f.window.Event('submit'));await tick();assert.match(f.root.querySelector('#ai-status').textContent,/Créditos insuficientes/);assert.equal(form.querySelector('button').disabled,true);
});
test('successful answer survives balance refresh failure and blocks repeat charges',async()=>{
 const f=fixture({balanceFailure:true});await tick();f.root.querySelector('[data-task]').click();const form=f.root.querySelector('#ai-form');form.querySelector('textarea').value='Pergunta';form.dispatchEvent(new f.window.Event('submit'));await tick();assert.match(f.root.querySelector('#ai-answer').textContent,/script/);assert.match(f.root.querySelector('#ai-status').textContent,/Recarregue/);assert.equal(form.querySelector('button').disabled,true);
});
test('restricted login and logout never show signup or password recovery',async()=>{
 const f=fixture({signedIn:false});await tick();assert(f.root.querySelector('#ai-login'));assert.equal(f.root.querySelector('a'),null);f.root.querySelector('[name="email"]').value='fixture@example.invalid';f.root.querySelector('[name="password"]').value='synthetic-password';f.root.querySelector('form').dispatchEvent(new f.window.Event('submit'));await tick();assert(f.root.querySelector('#ai-form'));f.root.querySelector('#ai-signout').click();await tick();assert(f.root.querySelector('#ai-login'));assert.equal(f.root.querySelector('[name="password"]').value,'');
});

test('account switch clears private text and discards an in-flight answer',async()=>{
 const f=fixture({pendingChat:true});await tick();f.root.querySelector('[data-task]').click();const form=f.root.querySelector('#ai-form');form.querySelector('textarea').value='Pergunta privada';form.dispatchEvent(new f.window.Event('submit'));await tick();f.switchAccount();f.finishChat();await tick();assert.equal(f.root.querySelector('#ai-answer')===null,true);assert(!f.root.textContent.includes('Resposta privada anterior'));assert(f.root.querySelector('#ai-login'));assert.equal(f.calls.filter(x=>x==='balance').length,1);
});
test('expired session removes old answer and prevents further AI requests',async()=>{
 const f=fixture();await tick();f.root.querySelector('#ai-answer').textContent='Conteúdo privado';f.expire();assert(!f.root.textContent.includes('Conteúdo privado'));assert(f.root.querySelector('#ai-login'));assert.equal(f.calls.filter(x=>x==='chat').length,0);
});

test('session recheck discards a response even before the auth-change event arrives',async()=>{
 const f=fixture({pendingChat:true});await tick();f.root.querySelector('[data-task]').click();const form=f.root.querySelector('#ai-form');form.querySelector('textarea').value='Pergunta privada';form.dispatchEvent(new f.window.Event('submit'));await tick();f.switchAccount(false);f.finishChat();await tick();assert.equal(f.root.querySelector('#ai-answer')===null,true);assert(!f.root.textContent.includes('Resposta privada anterior'));assert.equal(f.calls.filter(x=>x==='balance').length,1);
});
test('task must be selected before debit and selected ID is submitted',async()=>{
 const f=fixture();await tick();const form=f.root.querySelector('#ai-form');assert.equal(form.querySelector('button').disabled,true);form.querySelector('textarea').value='Texto';form.dispatchEvent(new f.window.Event('submit'));await tick();assert.equal(f.calls.filter(x=>x==='chat').length,0);f.root.querySelector('[data-task]').click();assert.equal(form.querySelector('button').disabled,false);assert.match(f.root.querySelector('#ai-task-help').textContent,/R\$ 1,00/);form.dispatchEvent(new f.window.Event('submit'));await tick();assert.equal(f.payloads[0].taskId,'resume_review');
});
