# Diagnóstico de recuperação — 21/10/2026

Homologação: registros entre 17:14 e 17:19 UTC confirmam /verify 200 às 17:15:38 e PUT /user 422 same_password às 17:16:16 e 17:16:41. O link novo foi validado. A alteração foi recusada porque a senha enviada coincide com a senha atual, sem ler ou expor seu conteúdo. O portal ocultava essa causa sob uma mensagem que pedia novo link desnecessariamente.

Tratamento explícito de same_password orienta escolher outra senha na mesma tela. Demais erros continuam como falha, sem declarar atualização concluída. Sem modificar credenciais, sessão, prazo de link, permissões ou retenção; alteração somente de feedback na prévia. Teste de regressão e testes de acesso/interface: 34 aprovados; build aprovado. Nova senha só pode ser inserida e salva pelo titular.

Revisão de privacidade mantém finalidade e hipótese da recuperação descritas em AUTH-RECOVERY-HOMOLOGATION.md, com acesso mínimo. LGPD (arts. 6/46) e orientações ANPD oficiais consultadas nesta etapa; nenhum dado adicional coletado/compartilhado ou decisão de acesso modificada. Sem certificação jurídica.
