# Programa de afiliados

Implementação: três perfis, link UUID individual, atribuição antes da primeira contratação, contador de pagamentos trimestrais confirmados incluindo renovações e resgate manual a cada mil. Primeiro código é lembrado por 30 dias neste navegador; o campo da contratação permite conferir/corrigir/remover antes da compra. Atribuição gravada no servidor é permanente. Não concede crédito retroativo a contratos anteriores.

Cada ID de pagamento elegível conta uma vez; recargas, destaques, outros ciclos, autoindicações, fictícios e estornos não contam. Resgate possui marco único e bloqueio transacional por afiliado; repetição do mesmo marco é idempotente. Resgates não fazem Pix nem compram equipamentos. Candidato: R$4.000 por Pix combinado com equipe. Empresa/instituição: equipamento útil até R$4.000. Aviso interno ao proprietário, painel com nome/e-mail/perfil/marco e registro manual de contato/conclusão. Reversão depois do pedido reduz contador e gera alerta ao consultar pedido; não debita usuário automaticamente. Não recalcula prêmio entregue nem faz cobrança automática.

Banco: db/affiliates.sql; tabelas com RLS, sem grants para anon/authenticated. API confirma usuário/e-mail/papel/conta ativa e não fictícia. RPCs security invoker, somente service_role. Ganhos não são acessíveis ao cliente por SQL direto. Afiliado só recebe agregados e seus pedidos. Proprietário recebe contato cadastrado apenas nos resgates. Equipe ainda não recebe acesso administrativo delegado; proprietário organiza contato fora do sistema.

Finalidades: atribuição da indicação, contabilização e execução da premiação contratada (LGPD art.7 V); minimização e transparência (arts.6 e9), acesso e correção por contato@oempregadoronline.com.br. Não guarda chave Pix nem documento adicional. Registros contratuais permanecem para conferência/obrigações aplicáveis; prazo específico de retenção e enquadramento jurídico/tributário do programa dependem de revisão. Não é certificação jurídica. Termos/Privacidade informam regras e armazenamento local do código. Fontes oficiais consultadas: https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares ; consulta ao Planalto foi bloqueada na execução.

Validação: build; testes com dados sintéticos para999/1000, cobranças recorrentes, reversão, autoindicação, vínculo e resgate idempotente, aviso interno e ausência de SELECT de clientes; regressão de sessão/navegação/assinaturas. Não foram criadas mil assinaturas reais, prêmio ou transferência real. Teste manual final de link em contas reais permanece distinto dos testes automatizados.

## Atualização de 28/10/2026 — marcos de 200 para candidatos e carência de 30 dias

Pedido do titular: "R$ 200,00 a cada 200 somente para candidatos", "a regra antiga continua para empresas e instituições de ensino" e premiação só 30 dias depois do pagamento, com cancelamento retirado da contagem.

- Candidato: R$ 200 (20000 centavos) a cada 200 pagamentos. Empresa/instituição: até R$ 4.000 (400000) a cada 1.000. Coluna `goal` em `affiliate_claims` registra o marco de cada resgate; resgates antigos sem `goal` contam como 1.000.
- Contagem madura: pagamento confirmado há 30 dias ou mais (`provider_paid_on`, senão `period_start`). Se `least(canceled_at, cancel_requested_at)` cair nesses 30 dias, o pagamento sai da contagem. `portal_affiliate_payments(p_user,p_cohort,p_matured)` devolve maduros ou em carência; a tela mostra os dois.
- `portal_affiliate_claim` exige contagem madura ≥ soma dos marcos já pedidos + marco do perfil.
- Migração: `db/affiliates-200-maturity.sql` = `supabase/migrations/20261028210000_affiliate_200_maturity.sql`. Aplicar no Supabase antes do merge.

LGPD: passa a usar as datas de pagamento e de cancelamento das assinaturas indicadas, já existentes nas tabelas de cobrança, só para aplicar a carência (minimização: o afiliado continua vendo apenas números). Base: execução de contrato (art. 7º, V). Política seções 2 e 8 e Termos seção 10 atualizados. Tributação de prêmio em dinheiro a candidatos continua pendente com contador.
