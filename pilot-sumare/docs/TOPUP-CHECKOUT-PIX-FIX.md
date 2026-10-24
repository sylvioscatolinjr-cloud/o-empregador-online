# Recuperação do checkout de recarga — 23/10/2026

## Ocorrência e causa comprovada

Titular relatou senha preenchida, clique em Comprar créditos e Conferir pagamento sem resultado visível. Leitura mínima da sua conta confirmou duas recargas de R$ 10 com status failed, sem checkout ou pagamento vinculado. A mensagem de erro estava acima do formulário, fora da região visível no celular; Conferir pagamento aparecia mesmo sem checkout.

Tentativa pontual de recuperação no servidor da compra já autorizada recebeu HTTP 400 do Asaas, invalid_object: Para gerar cobranças com Pix é necessário criar uma chave Pix no Asaas. O payload oferecia Pix e cartão juntos; a ausência da chave impedia criar inclusive o checkout de cartão. Logs anteriores não guardavam o motivo do provedor. A investigação consultou logs recentes e documentação oficial; não leu chaves de API nem credenciais para fora do servidor.

## Correção

- Consulta de capacidade no servidor via GET /pix/addressKeys?status=ACTIVE&limit=1. Somente o estado ACTIVE habilita Pix; ausência, chave pendente/removida ou falha de leitura mantém cartão. Dados da chave não são retornados ao navegador ou gravados em logs/banco.
- Cliente do Asaas permite somente essa leitura de chaves próprias. Criação, remoção e consulta de chaves externas continuam proibidas pelo cliente. Nenhuma chave Pix foi criada ou alterada.
- Checkout avulso usa somente os meios disponíveis, mantendo preço, aceite, senha, origem e identidade atuais. Cartão é o padrão seguro quando capacidade Pix não foi comprovada.
- Mensagens aparecem junto ao botão e no status geral, com alert e rolagem para a região visível. Sem checkout, o histórico explica a tentativa e não mostra Conferir pagamento. A API também recusa a conferência sem checkout com 409.
- Recarga pendente mostra Continuar pagamento no Asaas em destaque e esconde o formulário de nova compra, evitando repetir tentativa já aberta. O link continua o mesmo checkout.

## Recuperação real e limites

Script temporário de build, limitado ao proprietário configurado, turma do servidor, valor/termos exatos e horário da tentativa já aceita, reservou somente o pedido rejeitado correspondente. Conferiu papel ativo/não fictício e conta confirmada/não bloqueada. Não criou outra recarga, não enviou dados de pagador/cartão e não efetuou pagamento.

Após mudar o checkout para cartão, Asaas devolveu identificador válido, salvo no mesmo pedido. Consulta posterior confirmou pending, checkout existente e zero pagamentos vinculados. A rotina automática de recuperação foi removida do build; o script fica apenas como registro de operação privilegiada específica, com proteção contra repetição em pedido pendente. Carteira e assinatura não receberam crédito artificial. Confirmação financeira, crédito efetivo e recebimento ainda dependem do titular concluir o pagamento.

Pix permanece indisponível nesta conta até cadastrar e ativar uma chave no Asaas. A detecção na plataforma será automática após a chave estar ACTIVE; não é necessário publicar chave ou enviá-la pelo chat. A lista do servidor é somente da própria conta comercial, sem consulta a terceiros.

## Validação e privacidade

Testes focados cobrem estados de chave, indisponibilidade, não exposição de valores de chave, proibição de criar/remover/consultar chave externa, conferência sem checkout, mensagens perto do botão e continuação sem compra duplicada. Build local aprovado. Teste real de criação de checkout no cartão passou; não declarar pagamento real concluído. Conferência visual final no aparelho continua com o titular.

Finalidade: corrigir compra solicitada, comunicar falhas e evitar repetição. Dados mínimos: leitura dos registros da tentativa do titular e booleano de disponibilidade Pix; sem persistência nova, novas tabelas ou grants. Hipótese de referência permanece execução contratual/procedimento a pedido (art.7,V LGPD); retenção/direitos e atendimento conforme HYBRID-AI-WALLET.md. Estado de chave lido no servidor e descartado; transparência indica os meios realmente disponíveis. Diagnóstico temporário foi saneado para não registrar chave de API, dados do pagador ou identificadores bancários. Não há certificação jurídica de conformidade.

Fontes oficiais:
- https://docs.asaas.com/reference/listar-chaves
- https://docs.asaas.com/docs/checkout-para-pix
- https://docs.asaas.com/reference/criar-novo-checkout
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/glossario-anpd

Resultado final de QA: 313 testes gerais aprovados, zero falhas, um PDF privado ausente ignorado; 17 testes focados finais e build aprovados. Nenhuma chave Pix criada, nenhum pagamento executado ou saldo concedido por teste.


## Pix ativo nas recargas — 24/10/2026

Após o titular cadastrar sua chave, consulta real de produção GET /pix/addressKeys?status=ACTIVE&limit=1 confirmou chave ACTIVE; availableTopupMethods retornou [PIX,CREDIT_CARD]. Verificação no deployment dpl_61o6qg46MB6QQvT45NHF3yFJczuq, sem exposição do valor/identificador da chave, sem criação de cobrança, cliente ou checkout, sem pagamento ou alteração de carteira. Não declarar pagamento Pix ponta a ponta concluído.

Não foi necessário alterar a regra de checkout: cada nova recarga já consulta o Asaas, envia billingTypes dinâmico e exibe Pix/cartão na carteira. Checkouts antigos conservam os meios com que foram criados; não recriar uma compra pendente nem pagar novamente se houver dúvida. Recargas continuam creditadas somente após confirmação financeira conferida no servidor e aplicação idempotente. Onze testes focados de meios, recargas e carteira aprovados.

Mantido scripts/verify-pix-availability.mjs como conferência manual somente leitura; não invocar automaticamente em cada build. A configuração normal de build permanece npm run build. Assinaturas recorrentes continuam com cartão no checkout real; Pix comum nas recargas não habilita Pix Automático para planos. Documentação Asaas revista: listar-chaves, checkout-asaas, criar-novo-checkout e checkout-com-assinatura-recorrente.

Privacidade: mesma finalidade contratual de compra de créditos (art.7,V LGPD), sem nova coleta no portal; somente status/métodos resultantes da chave comercial são usados, valores de chaves não retornam ao navegador nem aos logs. Sem nova retenção ou alteração de acesso/direitos; registros financeiros existentes e atendimento preservados. Revisão LGPD/ANPD de continuidade permanece aplicável; não constitui certificação de conformidade.
