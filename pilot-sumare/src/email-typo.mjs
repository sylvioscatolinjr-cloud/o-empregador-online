/** Suggests a common provider domain when the typed one looks like a typo. Local only; nothing is sent or stored. */
const DOMAINS=['gmail.com','hotmail.com','hotmail.com.br','outlook.com','outlook.com.br','live.com','yahoo.com','yahoo.com.br','icloud.com','bol.com.br','uol.com.br','terra.com.br','oempregadoronline.com.br'];
function distance(a,b){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const next=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=next;}}return row[b.length];}
export function suggestEmailCorrection(value){
  const email=String(value||'').trim().toLowerCase(),at=email.lastIndexOf('@');
  if(at<1||at===email.length-1)return null;
  const local=email.slice(0,at),domain=email.slice(at+1);
  if(DOMAINS.includes(domain))return null;
  let best=null,score=3;
  for(const candidate of DOMAINS){const d=distance(domain,candidate);if(d<score){best=candidate;score=d;}}
  return best?`${local}@${best}`:null;
}
