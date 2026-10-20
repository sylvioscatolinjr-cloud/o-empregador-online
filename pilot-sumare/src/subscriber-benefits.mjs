// Public benefits contain no prices. They describe the approved commercial rules.
export function subscriberBenefits(tier) {
 if (!Number.isInteger(tier) || tier < 0 || tier > 3) throw Error('Nível inválido.');
 const aiPercent = [0,20,25,30][tier];
 return Object.freeze({tier, aiPercent, trainingLevel:tier, rollover:false, agentFunctionLevel:tier,
  priority:['Exibição após os assinantes','Antes dos perfis gratuitos','Antes do nível 1 e dos gratuitos','Exibição prioritária entre os planos'][tier],
  training:tier ? `Acesso aos treinamentos incluídos dos níveis 1${tier > 1 ? ` a ${tier}` : ''}` : 'Acesso aos recursos gratuitos',
 });
}
export function benefitList(tier) {
 const b=subscriberBenefits(tier);
 return [b.priority,b.training,...(tier ? [`${b.aiPercent}% do valor do pacote convertido em créditos de IA`,'Créditos válidos somente no ciclo, sem acumular'] : [])];
}
