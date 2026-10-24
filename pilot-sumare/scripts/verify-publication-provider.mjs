import {createClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';
// Explicit release smoke test. No user wallet or private content, no normal-build invocation.
import {generatePublicationImage} from '../src/publication-image.mjs';
export async function verifyPublicationProvider(env=process.env){
 const logo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAFzUkdCAK7OHOkAAACZSURBVHic7dBBEcAgAMAwQAVGeSF+yMhjjYJe577nGz+2dIDWAB2gNUAHaA3QAVoDdIDWAB2gNUAHaA3QAVoDdIDWAB2gNUAHaA3QAVoDdIDWAB2gNUAHaA3QAVoDdIDWAB2gNUAHaA3QAVoDdIDWAB2gNUAHaA3QAVoDdIDWAB2gNUAHaA3QAVoDdIDWAB2gNUAHaA3QAdoDlCUCh8jVj38AAAAASUVORK5CYII=';
 for(const settings of [{quality:'medium',ratio:'4:5',images:[{image_url:logo}]},{quality:'high',ratio:'16:9',images:[]}]){
  const bytes=await generatePublicationImage({env,role:'school_staff',question:'Crie uma composição geométrica abstrata verde e dourada para uma escola fictícia, sem texto, sem pessoas. A referência é apenas uma cor.',...settings});
  const db=createClient(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false}}),path='release-probes/'+randomUUID()+'.png',storage=db.storage.from('oeo-ai-images');const upload=await storage.upload(path,bytes,{contentType:'image/png',cacheControl:'0'});if(upload.error)throw Error('Private image upload failed');try{const signed=await storage.createSignedUrl(path,60);if(signed.error)throw Error('Private link failed');const delivered=await fetch(signed.data.signedUrl,{signal:AbortSignal.timeout(20000)});if(!delivered.ok)throw Error('Private delivery failed');const publicAccess=await fetch(env.SUPABASE_URL+'/storage/v1/object/public/oeo-ai-images/'+path,{signal:AbortSignal.timeout(20000)});if(publicAccess.ok)throw Error('Unexpected public image access');}finally{const removed=await storage.remove([path]);if(removed.error)throw Error('Probe cleanup failed');}
  console.log('PUBLICATION_IMAGE_SMOKE '+JSON.stringify({quality:settings.quality,ratio:settings.ratio,reference:!!settings.images.length,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),bytes:bytes.length,completed:true}));
 }
}
