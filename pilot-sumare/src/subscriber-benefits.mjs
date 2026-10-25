// Public benefits contain no prices. They describe the approved commercial rules.
export function subscriberBenefits(tier) {
 if (!Number.isInteger(tier) || tier < 0 || tier > 4) throw Error('Nível inválido.');
 const aiPercent = [0,20,25,30,30][tier];
 return Object.freeze({tier, aiPercent, trainingLevel:tier, rollover:false, agentFunctionLevel:0,
  priority:['Exibição após os assinantes','Antes dos perfis gratuitos','Antes do nível 1 e dos gratuitos','Antes do nível 2 e inferiores','Exibição prioritária entre os planos'][tier],
  training:tier ? `Acesso aos treinamentos incluídos dos níveis 1${tier > 1 ? ` a ${tier}` : ''}` : 'Acesso aos recursos gratuitos',
 });
}
export function benefitList(tier) {
 const b=subscriberBenefits(tier);
 return tier ? [
  `Recursos de IA do seu perfil em todos os planos, inclusive gratuito`,
  `${b.aiPercent}% do valor do pacote convertido em créditos de IA`,
  'Pesquisa externa Premium disponível com cobrança específica por uso',
  'Execuções usam créditos; ajuda, seleção, salvamento e retomada são gratuitos',
  'Créditos válidos somente no ciclo, sem acumular',
  `${b.priority}. Prioridade por plano na página inicial e na busca principal, após os destaques`,
  `${tier*3} treinamentos em texto, com atividades e progresso privado — sem certificado`
 ] : ['Cadastro e recursos gratuitos do portal','Recursos de IA do seu perfil, incluindo Agente livre, com créditos comprados à parte'];
}
