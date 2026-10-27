# Destaque pago — preparação para revisão

**Venda fechada:** habilitar `HIGHLIGHT_SALES_ENABLED` somente após migração, revisão e validação de ponta a ponta. O trabalho está em branch/PR e não indica publicação em produção.

Valores em centavos para 7/15/30 dias: candidato 990/1990/2990; vaga/curso/treinamento 2990/5990/9990. Descontos por nível pago vigente: 0/10/15/20/25%, arredondados ao centavo mais próximo (meio centavo para cima). O destaque não se renova e não usa saldo da carteira de IA.

O código inclui checkout e reconciliação Asaas, controle de propriedade, ativação e expiração por pagamento, tratamento de duplicidade e reversão, rodízio nos feeds, métricas aproximadas, interface dos três perfis e conferência pelo proprietário. Há testes locais com dados fictícios; eles não comprovam integração real com Asaas, banco e interface publicada. O clique individual de currículo não é contabilizado porque essa ação ainda não existe.

Antes de liberar: revisar a migração e os grants; comparar as funções substituídas com o banco atual; testar a migração em ambiente isolado e a integração em preview; conferir os eventos reais do provedor e os caminhos de falha, reversão e reconciliação; verificar celular e acessibilidade; confirmar implantação e configuração antes de habilitar a venda. Não criar cobranças reais automáticas.

Referências: https://docs.asaas.com/docs/payment-events ; https://supabase.com/docs/guides/database/postgres/row-level-security ; https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm ; https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares .

Em 26/10/2026, foram instaladas na homologação existente as dependências específicas de busca, distâncias, níveis e destaque. Teste transacional com os três perfis passou para criação, valor calculado pelo nível real, pagamento simulado, ativação, visualização e reversão; os registros do teste foram revertidos. RLS das quatro tabelas foi verificada: sem acesso a anon/authenticated e com acesso service_role. A aplicação atual de destaque usa o endpoint Asaas de produção; a chave sandbox existente está restrita a produção e não pode ser lida como segredo para copiar ao ambiente de prévia. A comunicação real com o Asaas para este fluxo ainda não foi validada; não habilitar vendas antes desse teste e da validação da prévia.

Em 26/10/2026, a prévia realizou chamada real ao Asaas Sandbox usando a estrutura de checkout de destaque: criação e consulta de cobranças por checkout retornaram HTTP 200, e a página hospedada exibiu o item correto de R$ 9,90 por sete dias. Nenhum pagamento foi realizado e a consulta retornou zero cobranças; isto não valida confirmação, webhook nem ativação automática. A chave Sandbox voltou a ficar restrita ao escopo anterior de produção, e o servidor de testes é separado da cobrança real. A rota de teste exige token temporário e é bloqueada fora da branch de prévia autorizada.
