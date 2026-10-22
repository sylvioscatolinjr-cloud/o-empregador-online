# Etapa 4 — validação financeira em andamento, 21/10/2026

## Evidência e limites

Produção mynjocetbsiaukefhkmz: consulta restrita aos booleanos connected, account_approved e webhook_ready retornou true nos três, updated_at 2026-10-21 12:50:45.851+00. São indicadores persistidos pelo diagnóstico anterior; não substituem nova chamada ao Asaas ou pagamento. Consulta ampla da configuração foi rejeitada pela revisão automática; alternativa mínima aprovada, sem leitura de segredos.

36 testes locais financeiros/de acesso passaram: valores do servidor, confirmação exata, estorno/contestação, período/renovação, autorização antes da reserva, recusa por plano/perfil, erro ou resposta incompleta da IA com devolução, catálogo e escolha de plano. As chamadas ao fornecedor nesses testes são simuladas.

Ensaio tests/hosted-billing-stage4.sql executado em transação no banco de produção: identidade fictícia com domínio example.invalid, pedido/pagamento sintéticos identificados como tal, saldo 398 centavos, reserva de 100, rejeição de repetição da requisição, reprocessamento do pagamento preservando gasto, devolução idempotente, três usos completos deixando 98 centavos, recusa por insuficiência, revogação após estorno e rejeição de snapshot antigo que tentava restaurar a elegibilidade. Privilégios de execução de cliente verificados. ROLLBACK ao final. Não houve chamada ao Asaas/OpenAI, envio de mensagem, pagamento ou crédito para usuário real. Consulta posterior: zero pedidos, pagamentos e eventos; zero identidades do ensaio.

## Próximo passo do titular

1. Acessar https://www.oempregadoronline.com.br/conta.html com a conta de proprietário master.sylvio@oempregadoronline.com.br, sem enviar senha no chat.
2. Abrir https://www.oempregadoronline.com.br/assinatura.html. Preencher a lista de cursos desejados se solicitado.
3. Escolher Candidato, nível 1, mensal, R$ 19,90. Conferir valor e recorrência, confirmar senha e aceite; gerar checkout uma única vez e abrir o link do histórico.
4. Concluir pessoalmente o pagamento real no Asaas. Não repetir tentativa incerta; conferir pedido e provedor antes de tentar novamente.
5. Voltar e clicar Conferir pagamento no Asaas/Atualizar histórico. Resultado esperado após confirmação: nível 1, crédito R$ 3,98, período correspondente. Selecionar plano ou retornar do checkout não basta.
6. Cancelar próximas renovações pelo portal após conferir, se não desejar recorrência. Cancelamento não é estorno; devolução de dinheiro é tratada no Asaas pelo responsável. Não prometer estorno automático.

Etapa 4 permanece pendente de checkout/pagamento real, evento/conciliação e crédito correspondente. Novos agentes não estão publicados no domínio: execução real com carteira de produção depende da implantação controlada da etapa 5. Não abrir contratação ao público por aprovação de testes simulados. Benefícios adicionais e receita geral ainda têm pendências no inventário.

## Privacidade e operação

Finalidade restrita à validação técnica da contratação solicitada. Ensaio usa somente dados fictícios; leitura real limitada a contagens e indicadores não sigilosos. Nenhum currículo, documento, contato de cliente, cartão ou segredo consultado. Não altera finalidade, consentimento, acesso ou retenção de usuários. Para contratação real, hipótese de trabalho é execução contratual, com transparência e direitos pelo atendimento já exibido; obrigações de retenção financeira devem ser definidas pelo controlador antes da abertura comercial. Testes não certificam conformidade jurídica. Riscos: falso sucesso por flags antigas, duplicação de compra por repetição e confusão entre teste/recebimento real, mitigados pelas distinções e orientações acima.

Fontes oficiais consultadas nesta etapa:
- https://docs.asaas.com/docs/webhook-para-cobrancas
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
- https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-vf.pdf
