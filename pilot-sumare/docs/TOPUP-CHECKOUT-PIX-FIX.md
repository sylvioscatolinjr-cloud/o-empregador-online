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
