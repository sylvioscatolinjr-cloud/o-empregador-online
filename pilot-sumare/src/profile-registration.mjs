import {requireRegistrationIdentity,registrationLookupKey} from './registration-identity.mjs';
export async function registerVerifiedProfile({supabase,admin,lookupSecret,accessToken,input}) {
 if(!lookupSecret||!admin||!supabase)throw Object.assign(Error('Serviço de cadastro ainda não configurado.'),{status:503});
 if(typeof accessToken!=='string'||accessToken.length>16000||!accessToken)throw Object.assign(Error('Entre na sua conta.'),{status:401});
 const {data,error}=await supabase.auth.getUser(accessToken),user=data?.user;
 if(error||!user?.id)throw Object.assign(Error('Entre na sua conta.'),{status:401});
 if(!user.email_confirmed_at)throw Object.assign(Error('Confirme seu e-mail para concluir o cadastro.'),{status:403});
 let identity;try{identity=requireRegistrationIdentity({...input,email:user.email});}catch(error){throw Object.assign(Error(error.message),{status:400});}
 const identityKey=await registrationLookupKey(identity,lookupSecret);
 const saved=await admin.rpc('register_pilot_identity',{p_user_id:user.id,p_identity_key:identityKey,p_profile_type:identity.profileType});
 if(saved.error)throw Object.assign(Error('Não foi possível concluir este cadastro. Confira os dados ou solicite atendimento.'),{status:409});
 return {registered:true};
}
