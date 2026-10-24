import {liveRequestFactory} from '../src/billing-live.mjs';
import {availableTopupMethods} from '../src/ai-topups.mjs';
// Explicit read-only production check. Never creates a checkout or prints Pix keys.
export async function verifyPixAvailability(env=process.env){
 const request=liveRequestFactory(env);
 const keys=await request('/pix/addressKeys?status=ACTIVE&limit=1');
 if(!Array.isArray(keys.data))throw Error('Invalid Pix capability response');
 const methods=await availableTopupMethods(async()=>keys);
 const result={activePixKey:keys.data.some(k=>k.status==='ACTIVE'),paymentMethods:methods};
 console.log('PIX_AVAILABILITY '+JSON.stringify(result));
 if(!result.activePixKey||!methods.includes('PIX'))throw Error('Pix is not active');
 return result;
}
