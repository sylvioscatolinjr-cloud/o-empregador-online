// Free leaked-password check for signup and password change (Supabase only offers it on Pro).
// Uses the Have I Been Pwned range API with k-anonymity: only the first five characters of the
// password's SHA-1 leave the browser; the password, the full hash and the e-mail never do.
// If the service is slow or unreachable the flow continues, so an outage never blocks sign-up.
const RANGE='https://api.pwnedpasswords.com/range/';
export const LEAKED_PASSWORD_MESSAGE='Essa senha já apareceu em vazamentos de dados conhecidos. Escolha outra senha.';

export async function sha1Hex(text,subtle=globalThis.crypto?.subtle){
 const digest=await subtle.digest('SHA-1',new TextEncoder().encode(text));
 return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
}

// Returns how many times the password appears in known breaches, or null when it could not be checked.
export async function leakCount(password,{fetch=globalThis.fetch,subtle=globalThis.crypto?.subtle,timeoutMs=4000}={}){
 if(typeof password!=='string'||!password||!subtle||typeof fetch!=='function')return null;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const hash=await sha1Hex(password,subtle),prefix=hash.slice(0,5),suffix=hash.slice(5);
  const response=await fetch(RANGE+prefix,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
  if(!response.ok)return null;
  for(const line of (await response.text()).split('\n')){const [candidate,count]=line.trim().split(':');if(candidate?.toUpperCase()===suffix)return Number(count)||0;}
  return 0;
 }catch{return null;}finally{clearTimeout(timer);}
}

export async function assertPasswordNotLeaked(password,options){if((await leakCount(password,options))>0)throw Error(LEAKED_PASSWORD_MESSAGE);}
