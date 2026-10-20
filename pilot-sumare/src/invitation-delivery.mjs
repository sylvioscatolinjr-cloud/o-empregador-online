/** Server-only adapter prepared for the external pilot. Not wired to the private demo. */
const email=value=>{const v=String(value||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)||v.length>254)throw Error('E-mail obrigatório e inválido.');return v;};
export function createInvitationDelivery({apiKey,from,origin,fetch:request=globalThis.fetch}={}){
 const configured=Boolean(apiKey&&from&&origin);let base;
 if(configured){base=new URL(origin);if(base.protocol!=='https:'||base.username||base.password||base.pathname!=='/'||base.search||base.hash)throw Error('Configure uma origem HTTPS fixa para os convites.');email(from);}
 return {configured,async deliver(invitation){
  // Call only from a server worker after an authorized durable outbox job is claimed.
  if(!configured)return {status:'not_configured',providerId:null};
  const to=email(invitation.email),id=String(invitation.id||''),token=String(invitation.token||'');
  if(!/^[a-zA-Z0-9_-]{8,120}$/.test(id)||!/^[a-zA-Z0-9_-]{32,256}$/.test(token))throw Error('Convite e token obrigatórios.');
  if(invitation.expiresAt<=Date.now()||invitation.status!=='awaiting_registration')return {status:'not_pending',providerId:null};
  const organization=String(invitation.organizationName||'').trim(),department=String(invitation.departmentName||'').trim();if(!organization||!department||organization.length>150||department.length>100)throw Error('Organização e departamento obrigatórios.');
  const link=new URL('/convite-equipe',base);link.searchParams.set('token',token);
  const text=organization+' convidou você para participar do departamento '+department+'.\n\nCadastre-se com seu CPF e este e-mail, confirme o endereço de e-mail e escolha se deseja aceitar ou recusar o vínculo. O cadastro não aceita a participação automaticamente.\n\n'+link.href+'\n\nSe não reconhecer o convite, ignore esta mensagem.';
  try{
   const response=await request('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json','Idempotency-Key':'team-invite/'+id},body:JSON.stringify({from,to:[to],subject:'Convite para '+organization,text}),signal:AbortSignal.timeout(15000)});
   if(!response.ok)return {status:'failed',retryable:response.status===429||response.status>=500,providerId:null};
   const result=await response.json();return result.id?{status:'submitted',providerId:result.id}:{status:'failed',retryable:true,providerId:null};
  }catch{return {status:'failed',retryable:true,providerId:null};}
 }};
}
