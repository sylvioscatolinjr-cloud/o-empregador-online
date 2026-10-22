# Cronograma de entrega — 30/10/2026

Meta de negócio: lançamento 05/11/2026, entrega para homologação 30/10/2026. Datas são metas, não garantia de funcionalidades não testadas.

20–21/10: auditar branch e deploy de produção, auth/RLS, IA, Asaas, banco e inventário dos recursos. Registrar bloqueadores P0.
22–23/10: backend dos três agentes, autenticação por perfil, cotas e créditos transacionais, limites de custo, respostas reais do provedor.
24–25/10: candidato (currículo, GPS, metas), empresa (diagnóstico, triagem assistida) e instituição (radar agregado, cursos), com persistência e testes.
26–27/10: página inicial sem preços, páginas de planos com benefícios e limites reais, upgrades, testes móveis.
28–29/10: integração ponta a ponta, RLS, privacidade dos adolescentes, pagamentos, acessibilidade, correção de P0/P1.
30/10: homologação, conferência do domínio, rollback e decisão de publicação somente dos módulos aprovados.
31/10–04/11: janela de estabilização e ensaio do piloto; não introduzir recursos de alto risco.
05/11: lançamento.

Proprietário: fornecer três contas de teste sem compartilhar credenciais; reservar janela de homologação; autorizar compra real controlada somente após revisão; aprovar textos e matriz comercial.

Critérios de aceite: login dos três perfis; agentes respondem com dados reais autorizados; metas persistem; limites e custos são cobrados corretamente; planos exibem exclusivamente benefícios entregues; fluxo financeiro homologado; isolamento entre organizações e perfis validado; fluxo do aluno de 16–17 anos revisado; testes e build verdes.

Regra de risco: bloquear publicação de qualquer funcionalidade sem testes; registrar o que for parcial e não vender como pronto. Aceleração por paralelização e entregas menores, nunca por eliminação de testes de segurança.
