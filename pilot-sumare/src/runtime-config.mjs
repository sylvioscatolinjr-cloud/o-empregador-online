const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function publicPilotConfig(env={}) {
 const missing=['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','PILOT_COHORT_ID','APP_ORIGIN'].filter(key=>!env[key]);
 if(missing.length)return {ready:false,message:'O cadastro do piloto está em preparação. A infraestrutura ainda não foi conectada.'};
 let url,origin;try{url=new URL(env.SUPABASE_URL);origin=new URL(env.APP_ORIGIN);}catch{return {ready:false,message:'A configuração de acesso precisa ser revisada.'};}
 const key=env.SUPABASE_PUBLISHABLE_KEY;
 if(url.protocol!=='https:'||url.origin!==url.href.replace(/\/$/,'')||url.username||url.password||origin.protocol!=='https:'||origin.origin!==origin.href.replace(/\/$/,'')||origin.username||origin.password||!uuid.test(env.PILOT_COHORT_ID)||!key.startsWith('sb_publishable_'))return {ready:false,message:'A configuração de acesso precisa ser revisada.'};
 if(env.PILOT_EMAIL_ENABLED!=='true')return {ready:false,message:'O envio dos e-mails de confirmação e recuperação ainda está em configuração.',...(env.VERCEL_ENV==='preview'&&env.AI_PREVIEW_LOGIN_ENABLED==='true'&&env.PUBLIC_REGISTRATION_OPEN!=='true'?{aiPreview:{supabaseURL:url.origin,publishableKey:key,cohortId:env.PILOT_COHORT_ID,origin:origin.origin},...(env.HIGHLIGHT_PREVIEW_PORTAL_ENABLED==='true'?{previewPortal:true}:{})}:{})};
 return {ready:true,supabaseURL:url.origin,publishableKey:key,cohortId:env.PILOT_COHORT_ID,origin:origin.origin,...(env.PUBLIC_REGISTRATION_OPEN==='true'?{publicRegistration:true}:{})};
}
