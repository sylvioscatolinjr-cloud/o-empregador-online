# Destaque pago — preparação para revisão

**Venda fechada:** habilitar `HIGHLIGHT_SALES_ENABLED` somente após migração, revisão e validação de ponta a ponta. O trabalho está em branch/PR e não indica publicação em produção.

Valores em centavos para 7/15/30 dias: candidato 990/1990/2990; vaga/curso/treinamento 2990/5990/9990. Descontos por nível pago vigente: 0/10/15/20/25%, arredondados ao centavo mais próximo (meio centavo para cima). O destaque não se renova e não usa saldo da carteira de IA.

O código inclui checkout e reconciliação Asaas, controle de propriedade, ativação e expiração por pagamento, tratamento de duplicidade e reversão, rodízio nos feeds, métricas aproximadas, interface dos três perfis e conferência pelo proprietário. Há testes locais com dados fictícios; eles não comprovam integração real com Asaas, banco e interface publicada. O clique individual de currículo não é contabilizado porque essa ação ainda não existe.

Antes de liberar: revisar a migração e os grants; comparar as funções substituídas com o banco atual; testar a migração em ambiente isolado e a integração em preview; conferir os eventos reais do provedor e os caminhos de falha, reversão e reconciliação; verificar celular e acessibilidade; confirmar implantação e configuração antes de habilitar a venda. Não criar cobranças reais automáticas.

Referências: https://docs.asaas.com/docs/payment-events ; https://supabase.com/docs/guides/database/postgres/row-level-security ; https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm ; https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares .
