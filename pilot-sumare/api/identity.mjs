import {createClient} from '@supabase/supabase-js';
import {publicPilotConfig} from '../src/runtime-config.mjs';
import {registerVerifiedProfile} from '../src/profile-registration.mjs';
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Robots-Tag','noindex');
 if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).json({error:'Método não permitido.'});return;}
 const config=publicPilotConfig(process.env);
 if(!config.ready||!process.env.SUPABASE_SECRET_KEY||!process.env.IDENTITY_LOOKUP_SECRET){res.status(503).json({error:'Cadastro ainda não configurado.'});return;}
 if(req.headers.origin!==config.origin||req.headers['sec-fetch-site']==='cross-site'){res.status(403).json({error:'Origem não autorizada.'});return;}
 if(!req.headers['content-type']?.startsWith('application/json')){res.status(415).json({error:'Formato inválido.'});return;}
 const length=Number(req.headers['content-length']||0);if(length>4096||JSON.stringify(req.body||{}).length>4096){res.status(413).json({error:'Dados excedem o limite.'});return;}
 try{
  const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
  const supabase=createClient(config.supabaseURL,config.publishableKey,options),admin=createClient(config.supabaseURL,process.env.SUPABASE_SECRET_KEY,options);
  const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];
  const result=await registerVerifiedProfile({supabase,admin,lookupSecret:process.env.IDENTITY_LOOKUP_SECRET,accessToken:token,input:req.body||{}});
  res.status(200).json(result);
 }catch(error){res.status(error.status||503).json({error:error.status?error.message:'O serviço de cadastro está indisponível. Tente novamente.'});}
}
