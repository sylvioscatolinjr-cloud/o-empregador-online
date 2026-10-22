export async function lookupPostal(postal,{fetcher=globalThis.fetch}={}){
 if(!/^\d{8}$/.test(postal))return null;
 try{const r=await fetcher('https://cep.awesomeapi.com.br/json/'+postal,{signal:AbortSignal.timeout(5000),redirect:'error',headers:{Accept:'application/json'}});if(!r.ok)return null;const p=await r.json(),lat=Number(p.lat),lon=Number(p.lng);
  if(p.cep!==postal||typeof p.lat!=='string'||!p.lat.trim()||typeof p.lng!=='string'||!p.lng.trim()||!Number.isFinite(lat)||!Number.isFinite(lon)||lat< -34||lat>6||lon< -74||lon> -34)return null;
  return {latitude:lat,longitude:lon};
 }catch{return null;}
}
export async function warmPostalCoordinates(db,cohort,{lookup=lookupPostal}={}){
 const listings=await db.rpc('portal_public_postal_codes',{p_cohort:cohort});if(listings.error)throw Error();
 const codes=[...new Set((listings.data||[]).map(x=>x.postal_code).filter(x=>/^\d{8}$/.test(x)))];
 if(!codes.length)return {missing:0};
 const cache=await db.from('portal_postal_coordinates').select('postal_code,latitude,longitude,checked_at').in('postal_code',codes);if(cache.error)throw Error();
 const fresh=new Set((cache.data||[]).filter(x=>Date.parse(x.checked_at)>Date.now()-30*86400000&&x.latitude!==null&&x.longitude!==null).map(x=>x.postal_code));
 const missing=codes.filter(c=>!fresh.has(c));
 // Bounded work across the whole cohort, never just the first result page.
 const attempted=missing.slice(0,8);for(let i=0;i<attempted.length;i+=4)await Promise.all(attempted.slice(i,i+4).map(async postal=>{const point=await lookup(postal);if(point){const r=await db.from('portal_postal_coordinates').upsert({postal_code:postal,...point,checked_at:new Date().toISOString()});if(r.error)throw Error();fresh.add(postal);}}));
 return {missing:codes.filter(c=>!fresh.has(c)).length};
}
