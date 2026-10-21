// Every agent task goes through here: daily ceiling, free allowance, paid credit and history in one place.
const failure=(status,error)=>({ok:false,status,error});
export const freeLimits=env=>({job_writer:Number(env.AGENT_FREE_DAILY_LIMIT||1),resume_reviewer:Number(env.AGENT_FREE_DAILY_LIMIT||1),guided_chat:0});
export async function meteredRun({db,env,userId,cohort,agent,task,inputChars,run,safe}){
 const reserve=await db.rpc('portal_agent_reserve',{p_actor:userId,p_cohort:cohort,p_agent:agent,p_limit:Number(env.AGENT_DAILY_LIMIT||10),p_input_chars:inputChars});
 if(reserve.error){const m=reserve.error.message||'';return m.startsWith('Limite diário')?failure(429,m):m.startsWith('Perfil sem acesso')?failure(403,'Seu perfil não tem acesso a este agente.'):failure(503,'Não foi possível reservar o uso do assistente.');}
 const {id,slot,role}=reserve.data||{};
 const finish=(status,extra={})=>db.rpc('portal_agent_finish',{p_run:id,p_status:status,p_model:null,p_usage:{},p_error:null,p_charge:null,p_task:task,p_result:null,...extra});
 let charge='free',remainingCreditCents=null;
 if(role!=='pilot_owner'&&slot>(freeLimits(env)[agent]??0)){
  const free=freeLimits(env)[agent]??0,used=free?`Você já usou ${free===1?'o uso gratuito':'os '+free+' usos gratuitos'} de hoje. `:'';
  if(env.AI_CHAT_METERING_ENABLED!=='true'){await finish('failed',{p_error:'Créditos de IA não ativados.'});return failure(402,used+'O uso com créditos dos planos ainda não está ativo.');}
  const paid=await db.rpc('portal_ai_paid_reserve',{p_user:userId,p_request:id});
  if(paid.error){await finish('failed',{p_error:'Sem créditos de IA.'});return failure(402,used+'Para continuar, é preciso ter créditos de IA de um plano. Nenhuma chamada à IA foi feita.');}
  charge='credit';remainingCreditCents=paid.data;
 }
 try{
  const out=await run();
  await finish('completed',{p_model:out.model,p_usage:out.usage,p_charge:charge,p_result:out.history??null});
  return {ok:true,out,charge,remainingCreditCents};
 }catch(error){
  const message=safe(error);
  if(charge==='credit'){const refund=await db.rpc('portal_ai_paid_refund',{p_user:userId,p_request:id});if(refund.error){await finish('failed',{p_error:'Devolução de crédito pendente.'});return failure(503,'Falha na IA. A devolução do crédito precisa de verificação administrativa.');}}
  await finish('failed',{p_error:message});
  return failure(503,charge==='credit'?message+' Crédito devolvido.':message);
 }
}
