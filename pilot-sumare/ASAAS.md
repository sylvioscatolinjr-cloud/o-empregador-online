# Integração Asaas — preparação em Sandbox

Preços mensais aprovados: Candidato gratuito / R$19,90 / R$49,90 / R$99,90. Empresa e Instituição de Ensino gratuito / R$99,00 / R$599,00 / R$2.990,00. Benefícios, créditos de IA e impulsionamentos ainda não definidos. Prioridade comercial não altera avaliação técnica em processos seletivos.

Implementado: catálogo de preços em centavos no servidor; adaptador exclusivamente Sandbox para criar assinatura mensal e consultar cobrança; validação de token de webhook em tempo constante. Testes locais usam respostas simuladas, sem criar clientes ou cobranças no Asaas.

Esta etapa NÃO oferece checkout, NÃO ativa planos e NÃO está integrada a uma conta Asaas. Nenhum endpoint de cobrança foi exposto. A criação de assinatura não confirma pagamento.

## Credenciais

Criar uma conta separada em https://sandbox.asaas.com e gerar a chave API em Integrações. Salvar diretamente na Vercel como segredo ASAAS_SANDBOX_API_KEY. Não enviar chaves em chat ou código. A chave de produção não substitui a de Sandbox.

## Próxima implementação antes da ativação

- Persistir clientes e tentativas de assinatura com proprietário validado pelo servidor. O perfil e preço nunca devem vir de campos editáveis do navegador. Organizações exigem autorização de administrador.
- Criar registro local antes do POST e bloquear concorrência; reconciliar por referência após falha ambígua, sem repetir criação automaticamente.
- Implementar checkout hospedado, cancelamento, troca de plano e listagem de cobranças; não coletar cartão no portal.
- Implementar webhook HTTPS com segredo próprio ASAAS_WEBHOOK_TOKEN (32–255 caracteres, diferente da API key). Persistir eventos com identificador único, tratar reenvios e ordem invertida; reconciliar cobrança pela API antes de atribuir acesso.
- Tratar confirmação, recebimento, atraso, estorno e chargeback por cobrança e período. Não retirar um período já pago por evento de outra fatura. Não ativar acesso com retorno do navegador ou simples criação da assinatura.
- Definir direitos e limites dos planos, testar fluxo real no Sandbox e somente depois habilitar produção.

Documentação consultada em 16/10/2026: https://docs.asaas.com/reference/criar-nova-assinatura ; https://docs.asaas.com/docs/webhook-para-cobrancas ; https://docs.asaas.com/docs/eventos-para-assinaturas

## Checkout Sandbox implementado em 16/10/2026

Página `/pagamentos.html`: login Supabase, recuperação de senha, configuração autenticada do webhook, seleção de perfil simulado e nível, criação de checkout recorrente hospedado e histórico privado. Acesso restrito ao e-mail configurado em BILLING_TEST_EMAIL; a escolha do perfil nesta página é exclusivamente uma simulação.

API `/api/billing`: preço recalculado no servidor, registro antes de chamada externa, índice único contra concorrência, limite de cinco tentativas por hora, bloqueio de repetição após resultado ambíguo. API `/api/billing?action=webhook`: segredo próprio, eventos deduplicados e confirmação por evento CHECKOUT_PAID. RPC de vinculação reconcilia notificação recebida antes de salvar o checkout. Nenhum redirecionamento concede plano. As tabelas são acessíveis somente pelo servidor, com RLS e privilégios revogados dos clientes.

Configuração adicional: ASAAS_WEBHOOK_TOKEN secreto, BILLING_TEST_EMAIL e a chave Sandbox já existente. O botão de conexão cadastra o webhook usando a API; o segredo nunca vai ao navegador. O endpoint de configuração verifica leitura no banco e GET de webhooks no Asaas, retornando apenas estado genérico e configuração publicável.

Limites: esta versão confirma o checkout inicial de teste e não concede benefícios reais. Ciclo completo de renovação, cancelamento da assinatura, estorno, chargeback e concessão de créditos permanecem necessários antes da produção. Checkout usa cartão fictício no ambiente Sandbox; não há formulário de cartão no portal. Tentativas em conferência exigem reconciliação assistida; não há repetição automática. Testes de navegador e pagamento autenticado dependem da entrada do responsável na própria conta. O domínio próprio ainda exige apontamento separado.

### Verificação da implantação

Commit de implementação: a8123dd1f09e6975cf132e99ce85c43f6df50259.
Vercel: dpl_9oJBTWUXWHs2PxheezBqXnp5dJnY, READY.
URL: https://o-empregador-online-piloto.vercel.app/pagamentos.html
Página HTTP 200; configuração Sandbox HTTP 200 verificou leitura com chave do servidor no Supabase e chamada autenticada GET /webhooks no Asaas. API de configuração do portal retornou ready=true. Admissão escolar permanece false. Testes locais: 28 aprovados, incluindo PostgreSQL, isolamento, duplicação e corrida de notificação antecipada. Build aprovado.

O webhook externo será cadastrado pelo responsável autenticado ao clicar em Conectar notificações do Asaas. A jornada autenticada e o pagamento fictício no checkout ainda não foram executados; não declarar homologação completa. O sistema armazena a confirmação do checkout inicial, sem conceder benefícios reais ou operar produção.

## Meios adicionais e pacotes — 16/10/2026

Valores aprovados: mensal sem desconto; trimestral 10%; semestral 20%; anual 30%. Fórmula em centavos: arredondar(mensalidade × meses × (100 − desconto) / 100). Arredondamento no total do pacote, nunca no equivalente mensal. O total do período é cobrado de uma vez e renovado no mesmo intervalo, sem parcelamento. Exemplo candidato nível 1: mensal R$19,90; trimestre R$53,73; semestre R$95,52; ano R$167,16.

Implementação adicional exclusivamente Sandbox:
- Cartão de crédito mantém checkout hospedado e ganha seleção de período.
- Pix convencional e boleto usam cliente fictício gerado no servidor, notificações desativadas, assinatura Asaas e fatura hospedada. O documento fictício é enviado somente ao Sandbox, sem usar CPF/CNPJ pessoal do responsável. O Pix é disponibilizado como QR Code e Copia e Cola quando retornado pelo Asaas.
- Pix Automático usa autorização com paymentCreationMode=SUBSCRIPTION, valor fixo, QR Code imediato e frequência. O início dos próximos ciclos é calculado com ajuste de fim de mês; a primeira cobrança imediata tem o mesmo valor do pacote. Suporte efetivo depende de elegibilidade/habilitação da conta Asaas.
- Débito e Pix parcelado não são anunciados como disponíveis.
- O botão Atualizar conexão Asaas atualiza o webhook existente com os novos eventos, sem criar outra configuração para a mesma URL.
- Notificações de cobrança e autorização são persistidas de forma idempotente. O estado ACTIVE de uma autorização não equivale à confirmação de pagamento. O primeiro pagamento tem estado próprio; renovações são exibidas por cobrança em consulta autenticada. Não há concessão de benefícios de produção.
- Recusa explícita 4xx deixa a tentativa como failed; resultados ambíguos ficam em review e impedem repetição automática.

Tabelas adicionais com acesso exclusivo do servidor e RLS: billing_sandbox_methods e billing_sandbox_method_events. Endpoint autenticado /api/billing-methods aplica allowlist do responsável, origem, valores e limite de tentativas. Notificações são recebidas no endpoint já existente. Revisão de segurança identificou somente o aviso de Auth preexistente sobre proteção contra senhas vazadas, além de informes esperados sobre tabelas exclusivas do servidor sem políticas de clientes.

Verificação: testes locais de preços para todos os perfis/níveis/períodos; contratos das requisições; autorização do proprietário; tentativa de adulterar valor; documentos fictícios e notificações desativadas; isolamento do banco; eventos repetidos/fora de ordem. A criação de Pix, boleto e Pix Automático na conta real de Sandbox ainda requer o teste autenticado do responsável. Não declarar esses meios homologados com base apenas em testes simulados.
