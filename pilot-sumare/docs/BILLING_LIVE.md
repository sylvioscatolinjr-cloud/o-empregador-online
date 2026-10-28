# Cobrança real — implantação de 19/10/2026

## Estado concreto

Fluxo financeiro separado do Sandbox: cartão recorrente em checkout hospedado Asaas, confirmação consultada pela API de produção, eventos autenticados, histórico por usuário, reautenticação antes de contratar/cancelar, cancelamento das próximas cobranças, registro de períodos pagos e créditos sem acúmulo. A contratação está restrita no servidor ao proprietário durante a validação. Não há ativação comercial para os demais perfis nem uso de agentes de IA nesta entrega.

A chave de produção já havia sido validada com conta APPROVED. A criação da variável ASAAS_PRODUCTION_WEBHOOK_TOKEN pela conexão Vercel retornou 403 por falta de acesso ao escopo. Sem essa variável, a API recusa cobrança e o build não registra o webhook real. O banco começa com connected/account_approved/webhook_ready=false. O upload da nova versão também retornou 403 no endpoint Vercel /v2/files. Não houve deploy desta implementação. Um Redeploy da versão antiga não incorpora estes arquivos; primeiro é necessário restabelecer permissão de publicação para a equipe sylvioscatolinjr-3982. Nenhum pagamento real foi executado durante o desenvolvimento.

## Ativação pendente no painel

No projeto Vercel o-empregador-online-piloto, cadastrar ASAAS_PRODUCTION_WEBHOOK_TOKEN como Sensitive/Secret, somente Production, com uma senha aleatória de 64 caracteres gerada em um gerenciador de senhas. Não reutilizar a chave API ou o token de Sandbox, não enviar em chat. Depois fazer Redeploy da versão com esta implementação.

O build, usando credenciais já guardadas no servidor, verifica /myAccount/status e configura apenas o webhook cujo destino é https://www.oempregadoronline.com.br/api/subscriptions?action=webhook. Não cria checkout, cliente nem cobrança. Falha no registro impede a nova publicação. O resultado técnico fica em billing_live_configuration; true não comprova pagamento end-to-end.

Abrir /assinatura.html com a conta ativa do proprietário. Preencher a lista de cursos, escolher plano e ciclo, conferir os valores e confirmar a senha. Gerar checkout não paga: o próprio usuário deve concluir o pagamento no Asaas, quando desejar validar dinheiro real. Conferir pagamento e período, depois cancelar a renovação. Solicitações de estorno devem ser tratadas no Asaas pelo responsável; os eventos atualizam a elegibilidade. Não existe botão de estorno automático no portal.

## Regras e limites

- Preços, descontos e créditos vêm exclusivamente do catálogo no servidor; a função do cadastro define o perfil.
- Valor recebido diferente do contratado não concede elegibilidade e revoga a liberação anterior daquele pagamento.
- Eventos e pagamentos são identificados por chaves únicas. Repetir evento não recarrega saldo; repetição preserva os créditos já gastos.
- Cada vencimento representa um período. A interface calcula saldo apenas do período vigente; não soma períodos ou renovações. Cancelamento da recorrência preserva período pago; estorno/contestação suspende a elegibilidade.
- A confirmação não depende de callback do navegador. Somente CONFIRMED/RECEIVED exatos, sem estorno/contestação, liberam registro financeiro.
- Subusuários não podem contratar neste piloto. A abertura comercial precisará vincular cobrança ao principal da organização, além de implementar benefícios de busca, treinamentos e agentes.
- Troca de plano bloqueada durante período pago ou assinatura aberta. Sem pró-rata automático. Checkout aberto expira em uma hora; assinatura confirmada pode ser cancelada com senha.
- Resultados incertos de criação permanecem em review, sem repetição automática. Conferir no painel Asaas pela externalReference do pedido antes de corrigir manualmente. Não criar nova cobrança às cegas.
- Pix, boleto e Pix Automático continuam exclusivamente no Sandbox. Não modificar uma assinatura diretamente no Asaas sem conciliação posterior.
- Receita do painel geral ainda não integrada ao novo ledger; usar o histórico financeiro e Asaas para esta validação. A IA ainda não consome créditos.
- Falta homologação de checkout/pagamento/renovação/cancelamento/estorno real e inspeção visual autenticada. Testes locais não substituem essas etapas.

## Privacidade e operação

Finalidade: executar a contratação solicitada, reconciliar pagamentos, controlar período/saldo e atender cancelamentos. Hipótese de trabalho: execução contratual (LGPD art. 7º, V); retenções legais e defesa de direitos exigem enquadramento específico pelo controlador, não consentimento genérico. Aceite de cobrança não autoriza marketing ou sorteios.

Dados mínimos no ledger: UUID do titular/coorte, perfil, nível/ciclo, valor, crédito, datas, versão das condições, referências de checkout/assinatura/pagamento/evento. Não persistir payload integral do Asaas, CPF/CNPJ bruto, cartão, CVV, senha ou segredo. O pagador informa dados ao Asaas; portal não repassa currículo ou carreira. Senha da reautenticação é transitória e nunca registrada pela aplicação.

RLS em todas as novas tabelas, privilégios revogados de anon/authenticated; acesso via servidor com verificação de titular. Segredos somente no ambiente de produção; sem fallback para Sandbox. Respostas no-store. Direitos e solicitação de estorno via contato exibido na página, com confirmação de identidade. Não excluir ledger financeiro automaticamente ao encerrar conta: verificar obrigações e litígios antes de exclusão/anonimização. Prazo detalhado e processo de retenção precisam ser definidos antes da abertura comercial; não há declaração de conformidade jurídica completa.

Referências oficiais consultadas em 19/10/2026:
- https://docs.asaas.com/reference/criar-novo-checkout
- https://docs.asaas.com/docs/checkout-com-assinatura-recorrente
- https://docs.asaas.com/docs/eventos-para-checkout
- https://docs.asaas.com/docs/webhook-para-cobrancas
- https://docs.asaas.com/reference/criar-novo-webhook
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-vf.pdf

Validação local: suíte completa 111 aprovados, 1 ignorado (PDF privado); testes financeiros focados também rerodados após ajuste de divergência de valor. Build local concluído. Migrações remotas 20261019172239 e 20261019172352 aplicadas.

## Atualização — publicação confirmada em 19/10/2026, 20h23 (Brasília)

A conexão Vercel foi restabelecida. Segredo de autenticação do webhook cadastrado como Sensitive, exclusivo de Production. Versão f49a983 publicada em dpl_572q7SRThc3FH9kWyMcHwUkHZRwj, estado READY, domínio www.oempregadoronline.com.br atribuído sem aliasError. Os bloqueios 403/404 descritos anteriormente foram resolvidos nesta etapa; não é necessário novo cadastro manual do segredo.

Configuração persistida pelo build: connected=true, account_approved=true, webhook_ready=true. Página /assinatura.html e JavaScript retornaram 200; API sem sessão retornou 401, webhook sem autenticação retornou 401. Nenhuma compra executada. A primeira validação com pagamento real continua a cargo do proprietário pelo checkout hospedado, com conferência posterior de período e cancelamento. A contratação permanece limitada ao proprietário, sem liberação comercial de benefícios pendentes.

## Pix nas assinaturas — 28/10/2026

O checkout recorrente do Asaas só aceita cartão. Pix usa checkout `DETACHED` de um período, sem `subscription_id`: `liveCheckoutBody(...,'PIX')`. A tela mostra a escolha quando `pixAvailable` (provedor configurado, vendas liberadas, fora de prévia e `SUBSCRIPTION_PIX_ENABLED` diferente de `false`). A chave Pix da conta Asaas é conferida na contratação. Pedidos Pix antigos ainda `active` sem assinatura são expirados antes de um novo checkout, por causa do índice `billing_live_one_open`. Cancelar um período Pix retorna 409 explicando que não há renovação a interromper. Sem mudança de banco. Primeiro pagamento real por Pix fica a cargo do titular. LGPD: nenhum dado novo; Asaas já declarado para Pix na Política; Termos seção 5 atualizados.
