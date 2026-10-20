import {requireRegistrationIdentity,registrationLookupKey} from './registration-identity.mjs';
const fail=(message,status)=>Object.assign(Error(message),{status});
export async function inviteTeamByCPF({supabase,admin,lookupSecret,accessToken,cohortId,input}){
 if(!lookupSecret||!supabase||!admin)throw fail('Serviço indisponível.',503);
 if(typeof accessToken!=='string'||!accessToken||accessToken.length>16000)throw fail('Entre na sua conta.',401);
 const {data,error}=await supabase.auth.getUser(accessToken),user=data?.user;
 if(error||!user?.id)throw fail('Entre na sua conta.',401);
 if(!user.email_confirmed_at)throw fail('Confirme seu e-mail.',403);
 if(input.purpose!==true||! /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(input.department||''))throw fail('Selecione o departamento e confirme a finalidade do CPF.',400);
 let identity;try{identity=requireRegistrationIdentity({profileType:'Candidato',email:user.email,document:input.document});}catch{throw fail('Informe um CPF completo com dígitos válidos.',400);}
 const key=await registrationLookupKey(identity,lookupSecret);
 const result=await admin.rpc('portal_invite_team_by_identity',{p_actor:user.id,p_cohort:cohortId,p_department:input.department,p_identity_key:key});
 if(result.error)throw fail('Não foi possível processar o convite. Confira seu acesso e departamento.',403);
 if(result.data?.limited)throw fail('Limite de convites atingido. Tente novamente mais tarde.',429);
 return {processed:true};
}
