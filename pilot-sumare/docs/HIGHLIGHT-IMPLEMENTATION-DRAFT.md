# Destaque pago — trabalho em andamento

**Não publicar ou habilitar a venda a partir deste rascunho.** A tabela aprovada está coberta por testes locais, mas a compra e a entrega ainda não foram integradas de ponta a ponta.

Tabela (centavos por 7, 15 e 30 dias): candidato 990/1990/2990; vaga/curso/treinamento 2990/5990/9990. Descontos por nível pago vigente: 0/10/15/20/25%. O valor final é arredondado ao centavo mais próximo, com meio centavo para cima. A seleção visual não concede desconto. Sem renovação automática e sem crédito da carteira de IA.

O trabalho em rascunho inclui tabela de preços, validação de checkout e de eventos de pagamento do Asaas, modelo de registro financeiro service-only com verificação de propriedade e nível pago, tratamento idempotente básico e interface simulada. Testes locais usam PGlite e fixtures; não provam integração real, entrega de campanha ou segurança completa. A interface, as rotas de cobrança e o SQL deste rascunho não estão conectados ao produto nem executados no banco.

Ainda necessário antes de liberar:
- Revisar concorrência (pedidos abandonados, pagamento tardio após outro pedido, reversão e segundo pagamento), transições e conciliação; garantir que pagamento não confirmado não gere benefício e um estorno retire-o.
- Criar migração formal, testar em ambiente isolado e analisar RLS/grants, idempotência, autenticação, erro de provedor e rollback sem tocar em dados reais.
- Conectar os quatro feeds e a busca delegada à elegibilidade temporal real, inclusive busca por distância, sem alterar indevidamente os registros fictícios. Manter consentimento de cartão público, filtros e isolamento de turma.
- Implementar rodízio justo de campanhas e métricas confiáveis de exibições/cliques, com proteção contra duplicação e informação clara sobre o que é contado; validar acessibilidade e celular.
- Conectar checkout, webhooks, consulta do pedido, retorno seguro, tela nos três perfis, histórico, expiração automática, falhas e suporte. Garantir critérios transparentes se o usuário fechar ou ocultar o item enquanto a campanha está ativa.
- Atualizar termos e política de privacidade, rever tratamento de dados e direitos, e testar alterações em preview via branch/PR antes do merge. Concluir testes ponta a ponta com ambiente adequado; sem novas compras reais para testar automaticamente.

Fontes oficiais: https://docs.asaas.com/docs/payment-events ; https://supabase.com/docs/guides/database/postgres/row-level-security ; https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm ; https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares .
