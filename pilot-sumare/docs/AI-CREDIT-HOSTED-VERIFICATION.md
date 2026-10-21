# Carteira de IA — ensaio transacional hospedado, 21/10/2026

Executado no Supabase isolado xxirjbsbfxwzplrcbbjt. Usuário sem senha em example.invalid, pedido e pagamento explicitamente SYNTHETIC, criados dentro de BEGIN/ROLLBACK; nenhum contato com Asaas ou OpenAI. As funções existentes foram chamadas sob claim service_role; a verificação de negação usou claim authenticated e consulta de privilégios. Não foi modificado código ou esquema.

Oito verificações aprovadas: reserva debita exatamente 100 centavos (398 para 298); request_id duplicado rejeitado; estorno por outro usuário rejeitado; estorno devolve 100 centavos e repetição mantém 398; saldo de 98 centavos bloqueado; período expirado bloqueado; valor de pagamento divergente bloqueado; claim comum rejeitado e authenticated sem privilégios diretos de executar reserva/ler ledger.

Após ROLLBACK, consulta independente confirmou zero usuários credit-probe e zero pagamentos SYNTHETIC-CREDIT-PROBE. Carteira da conta pessoal de teste continuou com 98 centavos. Nenhuma recarga ou cobrança real, senha modificada ou dado do currículo usado.

Este é um teste de banco hospedado, não uma execução pelo navegador nem teste de falha efetiva do provedor de IA. A chamada coordenada entre handler, provedor e carteira e a homologação financeira Asaas continuam exigindo suas próprias evidências. Oito testes não provam concorrência completa, todos os perfis/planos ou conformidade jurídica.

Finalidade: verificar contabilização e acesso usando exclusivamente fixtures descartáveis, sem novo tratamento de dados pessoais. Preservadas finalidade/hipóteses e orientações LGPD/ANPD registradas em AI-TASKS.md. Registros sintéticos revertidos na transação; relatório guarda apenas resultados e lógica, sem credenciais ou identificadores pessoais. Roteiro reproduzível em tests/hosted-ai-credit-rollback.sql. Não executar em produção.
