/** Server-side registration/lookup policy. Persist only the keyed lookup, never this raw input. */
const normalizeDocument=v=>String(v||'').toUpperCase().replace(/[.\-/\s]/g,'');
function cpfValid(n){if(!/^\d{11}$/.test(n)||/^(\d)\1+$/.test(n))return false;for(let len=9;len<=10;len++){let sum=0;for(let i=0;i<len;i++)sum+=Number(n[i])*(len+1-i);let digit=sum*10%11;if(digit===10)digit=0;if(digit!==Number(n[len]))return false;}return true;}
function cnpjValid(n){if(!/^[A-Z0-9]{12}\d{2}$/.test(n)||/^(\d)\1+$/.test(n))return false;const digit=text=>{let sum=0,w=2;for(let i=text.length-1;i>=0;i--){sum+=(text.charCodeAt(i)-48)*w;if(++w===10)w=2;}const r=sum%11;return r<2?0:11-r;};return digit(n.slice(0,12))===Number(n[12])&&digit(n.slice(0,13))===Number(n[13]);}
export function requireRegistrationIdentity(input){
 const kinds={Candidato:'CPF',Empresa:'CNPJ','Instituição de Ensino':'CNPJ'},kind=kinds[input.profileType];if(!kind)throw Error('Tipo de cadastro obrigatório.');
 const email=String(input.email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw Error('E-mail obrigatório.');
 const document=normalizeDocument(input.document);if(!(kind==='CPF'?cpfValid(document):cnpjValid(document)))throw Error(kind+' obrigatório com formato e dígitos válidos.');
 return {profileType:input.profileType,kind,email,document};
}
export async function registrationLookupKey(identity,secret,cryptoAPI=globalThis.crypto){
 if(typeof secret!=='string'||secret.length<32)throw Error('Configure o segredo de identidade somente no servidor.');
 const encoder=new TextEncoder(),key=await cryptoAPI.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const bytes=await cryptoAPI.subtle.sign('HMAC',key,encoder.encode(identity.kind+':'+identity.document));return identity.kind+':'+Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,'0')).join('');
}
export function requireInvitationAccount(invitation,verifiedUser,lookupKey,now=Date.now()){
 if(!verifiedUser?.id||!verifiedUser.email_confirmed_at)throw Error('Confirme o e-mail da conta.');
 if(!invitation||invitation.expiresAt<=now||invitation.status!=='awaiting_registration'||invitation.email.toLowerCase()!==verifiedUser.email?.trim().toLowerCase()||invitation.identityKey!==lookupKey)throw Error('Convite incompatível com a identidade cadastrada.');
 return {userId:verifiedUser.id,invitationId:invitation.id};
}
