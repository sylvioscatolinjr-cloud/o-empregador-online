# IA em todos os planos e recargas avulsas — 23/10/2026

## Autorização e comportamento

Sylvio autorizou implementar a proposta comercial discutida: todos os recursos de IA do próprio perfil em qualquer plano, agente livre por categoria e compra avulsa de créditos sem subir de plano. Isso autoriza a abertura das recargas às contas reais confirmadas/ativas, inclusive gratuitas; não autoriza uma compra de teste em nome do titular. A contratação pública de assinaturas continua com o bloqueio anterior de validação pelo proprietário, sem ativar benefícios de roadmap.

Catálogo: 18 tarefas guiadas + Agente livre por perfil, 57 opções no total. Cada execução normal custa 100 centavos. A função livre é textual, limitada ao contexto profissional do perfil, com pergunta até 4.000 caracteres, entrada limitada e saída até 1.800 tokens. Não pesquisa a internet, não lê outros cadastros nem executa ferramentas/ações. A revisão do currículo permanece em fluxo próprio, com fontes da mesma conta, autorização de envio e salvamento seletivo. Histórico de texto continua opcional e privado. Cada envio subsequente é uma nova execução confirmada; não há conversa ilimitada por R$ 1.

Treinamentos, prioridades de busca, percentuais de créditos e valores/períodos das assinaturas preservados. Nenhuma recarga concede assinatura, prioridade, pontuação ou acesso a treinamentos pagos. Modo exclusivo do proprietário preserva 60 tentativas por dia em Brasília, sem débito da carteira; agora pode testar os 57 recursos. A recarga não muda esse modo de teste.

## Carteira e pagamentos

Tela /carteira.html e atalho Minha carteira de IA no menu de cada perfil. Recargas fixas R$ 10/25/50, sem desconto, sem vencimento e sem renovação automática. Checkout Asaas de compra avulsa (DETACHED), Pix ou cartão, sem parcelamento/assinatura. Identificadores e preço gerados no servidor; conta confirmada, papel ativo/não fictício, origem e senha conferidos. Nenhuma identidade de organização delegada é aceita para comprar em nome de terceiros. Compra não exige wishlist de cursos, pois não é assinatura.

RLS e ausência de grants de navegador em quatro tabelas novas. RPCs SECURITY INVOKER somente service_role; busca mínima de colunas Auth já autorizadas, sem novos privilégios de Auth. Carteira isolada por usuário/turma/perfil real para crédito de assinatura. Consumo usa créditos de plano a vencer primeiro e depois recargas; suporta fracionar uma execução entre fontes. Débito de 100 centavos com trava transacional por usuário e linhas auditáveis; falha do provedor devolve às mesmas fontes, uma única vez. Reserva insuficiente reverte integralmente a transação. Funções antigas de consumo permanecem para auditoria/compatibilidade, mas os handlers novos usam a carteira unificada.

Confirmação exige consulta fresca à API Asaas, checkout exato, valor exato e situação CONFIRMED/RECEIVED, sem exclusão, reembolso em andamento ou contestação. Callback do navegador, CHECKOUT_PAID isolado e dados financeiros enviados pelo cliente não concedem saldo. Webhook existente passa a conciliar recargas além das assinaturas, com eventos idempotentes. Uma recarga aceita um único pagamento; pagamento extra/incompatível exige conferência em vez de novo crédito silencioso. Snapshots antigos não restauram saldo revogado. Pagamento revertido com crédito já usado bloqueia novas execuções até conferência administrativa; não cria dívida bancária nem cobra automaticamente o cliente.

Uma tentativa aberta por conta/turma e no máximo três criações por hora. Resposta financeira incerta fica em review, sem repetição automática. Conferir pagamento faz consulta pontual por checkout e revalida cada pagamento diretamente. Se o Asaas ainda não o listar, continua pendente, sem nova cobrança ou crédito inventado. Uma tentativa review sem vínculo exige reconciliação administrativa; não há cancelamento automático de cobranças nessa rotina.

## Validação e limites

- 307 testes gerais aprovados, zero falhas; um PDF privado ausente ignorado.
- 27 testes focados finais aprovados, incluindo API de compra dos três perfis, preço/consentimento/senha/origem, pausa operacional, webhook autenticado e duplicado, UI de confirmação/redirecionamento, IA e carteira PostgreSQL.
- Build local aprovado. Teste SQL em produção com conta/turma sintéticas e rollback passou: crédito único, débito, devolução idempotente, negação a outro usuário, insuficiência, revogação e acesso direto negado ao navegador. Conferência posterior: zero turmas temporárias, zero recargas e zero consumos novos persistidos.
- Migrações de produção 20261023123926_ai_wallet_topups_and_scoped_consumption e 20261023124544_topup_revocation_preserves_new_pending_checkout aplicadas; cópia canônica db/ai-wallet-topups.sql. Sem alteração de carteira, plano ou pagamento preexistente.
- Advisors sem novos WARN/ERROR. INFO de tabelas service-only sem política de cliente é intencional. Aviso anterior de proteção contra senha vazada desativada permanece.
- Nenhuma chamada real ao modelo, checkout real, compra, e-mail ou aviso gerado na validação. Provedor financeiro e IA simulados nos testes de API. Primeiro checkout/recebimento real de recarga ainda precisa de validação do titular no navegador. Não declarar teste financeiro ponta a ponta real concluído.
- Sem navegador local disponível para inspeção visual autenticada; responsividade usa o padrão portal-action e a grade móvel já corrigida. Confirmação no aparelho ainda necessária.

## Operação e avaliação comercial

AI_TOPUPS_ENABLED=false pausa somente novas compras (exige nova implantação para variável de ambiente); leitura da carteira, confirmação de pagamentos já existentes e uso dos créditos permanecem. Não reverter a implantação para versão sem carteira depois de aceitar recargas reais: preparar correção compatível ou pausar novas compras, preservando saldos e conciliação. Não apagar tabelas/lançamentos como rollback.

Dados de pedidos/pagamentos e reservas permitem apuração administrativa futura: recargas confirmadas, consumo, falhas/estornos, recompra e contribuição por perfil. Créditos incluídos no plano não são receita adicional ao serem usados. Avaliar em 60–90 dias contribuição incremental das recargas contra upgrades/renovações perdidos; não foi criado nesta etapa um painel novo de lucratividade, nem se promete rentabilidade comprovada. Painel antigo de receita não constitui conciliação desta nova carteira. Custos reais incluem API, taxas de pagamento, tributos, suporte e infraestrutura.

## Privacidade e revisão LGPD/ANPD

Finalidade: executar compra de créditos e assistência profissional solicitadas pelo titular, manter saldo correto e prevenir duplicidade/fraude. Dados mínimos novos: identificador da conta/turma, pedido/checkout/pagamento, valor, situação, versão dos termos, horários e origem de cada débito/devolução. Não copiar documentos, cartão, senha ou prompts para registros financeiros. O Asaas coleta dados necessários no checkout hospedado; não há novo upload nessa etapa. A OpenAI recebe somente o texto explicitamente enviado e autorizado no fluxo existente, store:false, sem coleta automática de outros cadastros. Histórico profissional só é salvo por decisão explícita do usuário.

Hipótese de referência para execução é art.7,V da LGPD (contrato/procedimentos a pedido); manutenção de registros para obrigações legais e exercício de direitos depende da política aplicável, sem nova alegação genérica de consentimento obrigatório para tudo. Transparência no preço, confirmação, encaminhamento ao Asaas, validade distinta entre plano/recarga, usos e atendimento na própria tela. Carteira não é conta bancária e não permite transferir créditos entre usuários.

Acesso financeiro restrito ao serviço após autenticação/escopo. Registros financeiros não são apagados automaticamente com o fechamento de sessão e não têm purga nova nesta implantação: revisão de retenção fiscal/contratual e eventual anonimização/exclusão exige procedimento administrativo, evitando apagar a evidência de saldo ainda devido. Usuário pode solicitar atendimento/reembolso/direitos no contato exibido; apagar orientações continua independente da carteira. Textos profissionais permanecem no navegador até salvamento opcional, sem cache offline privado. Riscos: dados sensíveis em pedido livre, uso excessivo, fraude, cobrança em duplicidade e expectativa de resposta garantida; mitigados por orientação, limites de entrada/saída, confirmação, reserva transacional, idempotência, restituição após falha e revisão humana. Não se declara conformidade jurídica integral.

Fontes oficiais consultadas:
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/glossario-anpd
- https://supabase.com/docs/guides/database/functions
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://docs.asaas.com/docs/asaas-checkout
- https://docs.asaas.com/reference/listar-cobrancas
- https://docs.asaas.com/reference/criar-novo-checkout
