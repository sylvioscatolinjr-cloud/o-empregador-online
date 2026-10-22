import {requireRegistrationIdentity} from './registration-identity.mjs';
/** External pilot only. Uses an injected official Supabase client; no custom password/session implementation. */
export class PilotAccessError extends Error {
  constructor(code, message) { super(message); this.name='PilotAccessError'; this.code=code; }
}
const fail=(code,message)=>{throw new PilotAccessError(code,message)};
const cleanEmail=value=>String(value||'').trim().toLowerCase();
function validateEmail(value){const email=cleanEmail(value);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)fail('invalid_email','Confira o e-mail informado.');return email;}
function validatePassword(value){if(typeof value!=='string'||value.length<12||value.length>128)fail('invalid_password','Use uma senha com 12 a 128 caracteres.');return value;}
export function createPilotAccess({supabase,cohortId,origin,publicRegistration=false}) {
  if(!supabase?.auth||!supabase?.from||!supabase?.rpc)fail('configuration','Serviço de acesso não configurado.');
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cohortId||''))fail('configuration','Turma não configurada.');
  const url=new URL(origin);if(url.protocol!=='https:'||url.username||url.password)fail('configuration','O piloto exige um endereço HTTPS.');
  const redirect=url.origin+'/conta/confirmar';
  let status={phase:'signed_out',role:null};
  const set=value=>(status={phase:value.phase,role:value.role||null});
  async function currentUser(){const {data,error}=await supabase.auth.getUser();if(error||!data?.user){set({phase:'signed_out'});fail('authentication_required','Entre na sua conta para continuar.');}if(!data.user.email_confirmed_at){set({phase:'verification_required'});fail('verification_required','Confirme seu e-mail antes de continuar.');}return data.user;}
  async function loadAccess(){
    // Keep the last verified role while refreshing. Callers still await the new
    // server authorization; failures and revoked memberships clear access below.
    if(status.phase!=='active')set({phase:'checking'});
    try{const user=await currentUser();const {data,error}=await supabase.from('pilot_memberships').select('role,status').eq('cohort_id',cohortId).eq('user_id',user.id).maybeSingle();
      if(error){set({phase:'unavailable'});fail('unavailable','Não foi possível conferir seu acesso. Tente novamente.');}
      if(!data&&publicRegistration){const joined=await supabase.rpc('portal_join_public_test',{p_cohort_id:cohortId});if(joined.error){set({phase:'unavailable'});fail('unavailable','Não foi possível liberar seu acesso. Tente novamente.');}if(joined.data===true){const membership=await supabase.from('pilot_memberships').select('role,status').eq('cohort_id',cohortId).eq('user_id',user.id).maybeSingle();if(membership.error){set({phase:'unavailable'});fail('unavailable','Não foi possível conferir seu acesso.');}if(membership.data?.status==='active'&&['learner','recruiter','school_staff'].includes(membership.data.role)){set({phase:'active',role:membership.data.role});return {...status};}}}if(!data){set({phase:'invitation_required'});return {...status};}
      if(data.status!=='active'){set({phase:'access_restricted'});return {...status};}
      if(!['learner','school_staff','recruiter','pilot_owner'].includes(data.role)){set({phase:'access_restricted'});return {...status};}
      set({phase:'active',role:data.role});return {...status};
    }catch(error){if(!(error instanceof PilotAccessError)){set({phase:'unavailable'});fail('unavailable','O serviço de acesso está indisponível.');}throw error;}
  }
  return {
    snapshot(){return {...status};},
    async signUp({email,password,name,profileType,document}){if(!['Candidato','Empresa','Instituição de Ensino'].includes(profileType))fail('invalid_profile','Escolha Candidato, Empresa ou Instituição de Ensino.');email=validateEmail(email);requireRegistrationIdentity({email,profileType,document});validatePassword(password);name=String(name||'').trim();if(!name||name.length>100)fail('invalid_name','Informe seu nome, com até 100 caracteres.');
      const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:redirect,data:{display_name:name,signup_profile_type:profileType}}});
      if(error?.code==='over_email_send_rate_limit'||error?.status===429)fail('email_rate_limit','Aguarde alguns minutos antes de solicitar outro e-mail.');if(error)fail('signup_failed','Não foi possível concluir o cadastro. Confira os dados ou use a recuperação de acesso.');set({phase:'verification_required'});return {...status};},
    async signIn({email,password}){email=validateEmail(email);if(typeof password!=='string'||!password)fail('invalid_password','Informe sua senha.');set({phase:'checking'});const {error}=await supabase.auth.signInWithPassword({email,password});if(error){if(error.code==='email_not_confirmed'){set({phase:'verification_required'});fail('verification_required','Seu e-mail ainda não foi confirmado. Solicite um novo link abaixo.');}set({phase:'signed_out'});fail('invalid_credentials','Não foi possível entrar. Confira os dados ou recupere seu acesso.');}return loadAccess();},
    async resendConfirmation(email){email=validateEmail(email);const {error}=await supabase.auth.resend({type:'signup',email,options:{emailRedirectTo:redirect}});if(error){if(error.status===429||['over_email_send_rate_limit','over_request_rate_limit'].includes(error.code))fail('email_rate_limit','Aguarde alguns minutos antes de solicitar outro e-mail.');fail('confirmation_unavailable','O serviço não confirmou o reenvio. Tente novamente mais tarde.');}return {message:'Se este e-mail tiver cadastro aguardando confirmação, o serviço enviará um novo link. Confira também o spam e abra somente a mensagem mais recente no mesmo navegador.'};},
    refresh:loadAccess,
    async redeemInvitation(token){await currentUser();if(typeof token!=='string'||!/^[a-zA-Z0-9_-]{32,256}$/.test(token))fail('invalid_invitation','Confira o convite individual enviado para você.');const {error}=await supabase.rpc('redeem_pilot_invite',{p_cohort_id:cohortId,p_invite_token:token});if(error){set({phase:'invitation_required'});fail('invitation_denied','Não foi possível liberar este convite. Confira sua validade com o responsável pelo piloto.');}return loadAccess();},
    async requestPasswordReset(email){email=validateEmail(email);const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:url.origin+'/conta/recuperar'});if(error)fail('reset_unavailable','O serviço não confirmou a solicitação. Tente novamente mais tarde.');return {message:'Se houver uma conta para este e-mail, você receberá as instruções de recuperação.'};},
    async changePassword(password){validatePassword(password);await currentUser();const {error}=await supabase.auth.updateUser({password});if(error?.code==='same_password')fail('same_password','A nova senha precisa ser diferente da senha atual. Escolha outra senha e tente salvar novamente nesta tela.');if(error)fail('password_change_failed','Não foi possível atualizar a senha. Tente novamente; se sua sessão expirou, solicite um novo link de recuperação.');return {changed:true};},
    async signOut(){try{const {error}=await supabase.auth.signOut();if(error)fail('signout_unconfirmed','A saída não foi confirmada pelo serviço. Tente novamente.');}finally{set({phase:'signed_out'});}return {...status};}
  };
}
