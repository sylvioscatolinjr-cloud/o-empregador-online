// Separate production diagnostics: never falls back to Sandbox and cannot create charges.
export async function productionBillingReadiness({env=process.env,fetchImpl=fetch}={}) {
 const missing=[];
 if(!env.ASAAS_PRODUCTION_API_KEY)missing.push('ASAAS_PRODUCTION_API_KEY');
 const pending=['checkout_real','renovacao_cancelamento_estorno','concessao_por_pagamento','homologacao_financeira'];
 if(missing.length)return {environment:'production',ready:false,missing,pending,connected:false};
 const response=await fetchImpl('https://api.asaas.com/v3/myAccount/status',{method:'GET',headers:{access_token:env.ASAAS_PRODUCTION_API_KEY,'User-Agent':'OEmpregadorOnline/0.1','Accept':'application/json'},redirect:'error',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Não foi possível validar a conexão de produção do Asaas. Confira a chave e a situação da conta.');
 const data=await response.json(),known=['APPROVED','PENDING','AWAITING_APPROVAL','REJECTED'];
 return {environment:'production',ready:false,missing,pending,connected:true,accountStatus:known.includes(data.general)?data.general:'UNKNOWN'};
}
