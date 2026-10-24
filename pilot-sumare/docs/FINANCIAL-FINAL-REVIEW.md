# Revisão financeira e isolamento de assinaturas — 24/10/2026

## Correção publicada

As consultas de histórico, conferência, cancelamento, tentativas recentes e existência de pagamento agora restringem pedidos ao usuário autenticado e à turma configurada no servidor. O resumo de benefícios considera exclusivamente o perfil ativo. Histórico de outro perfil da mesma conta/turma continua visível para permitir atendimento/cancelamento, mas não concede benefícios ao perfil atual. Webhooks autenticados continuam conciliando os pedidos pelo vínculo real do provedor; essa rota não recebe um filtro incorreto de perfil do navegador.

Antes, a leitura e algumas operações verificavam apenas user_id, permitindo misturar ambientes da mesma conta. Não foi identificada exposição a outra conta nem alteração indevida de pagamento real. Os testes novos exercitam os dois limites: outro usuário e outra turma; nesses casos nenhuma chamada Asaas ou mutação ocorre.

## Evidência

- 41 testes financeiros focados aprovados, incluindo cinco novos cenários de isolamento/cancelamento.
- Suíte geral: 355 aprovados, zero falhas, um teste ignorado por ausência de PDF privado (356 total).
- Build local concluído. Apenas api/subscriptions.mjs alterado no funcionamento; sem migração, novo grant, preço ou liberação pública de assinaturas.
- Cancelamento simulado exige confirmação de senha, interrompe renovação e preserva pagamento e período vigente. Renovação, expiração, estorno, contestação, evento antigo, pagamento duplicado e saldos fracionados cobertos pelos testes financeiros existentes.
- Leitura agregada real em produção: zero eventos aguardando processamento, zero assinaturas/recargas em creating/review e zero imagens em processing/review no momento da consulta. Isso não prova saúde futura nem substitui monitoramento.
- Sem checkout, pagamento, cancelamento, estorno, e-mail ou chamada de IA real nessa revisão. Não cancelar assinatura vigente para marcar teste como concluído.

## Limites e próximos aceites

Compra no cartão/credito da recarga já confirmada pelo titular. Chave Pix ACTIVE e oferta de Pix/cartão verificadas; pagamento Pix real ainda pendente. Renovação/cancelamento/estorno reais continuam pendentes de necessidade e autorização específica do titular. Contratação pública permanece restrita ao proprietário até revisão final dos benefícios e piloto; esta correção não altera essa decisão. Leitor de tela/aparelho/PWA, conteúdo PPTX/link/senha, revisão final de adolescentes e benefícios comerciais ainda precisam dos aceites listados no checklist. Não declarar todo o projeto concluído.

## Privacidade

Finalidade: execução e conferência da assinatura solicitada, sob hipótese de referência contratual (LGPD art.7,V), minimização e prevenção de mistura de contextos. Dados existentes: identificador de usuário/turma/perfil, pedido e pagamento; sem nova coleta, tabela, fornecedor ou retenção. Acesso restrito pelo servidor, histórico próprio e direitos/atendimento preservados; nenhuma permissão derivada de user_metadata ou perfil enviado pelo navegador. Sem gravação de segredos/documentos ou dados privados em evidências. Risco mitigado: exibição/uso de período de outro contexto; não se declara certificação jurídica.

Fontes oficiais consultadas: LGPD https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm ; ANPD https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte ; Supabase changelog.md e https://supabase.com/docs/guides/database/postgres/row-level-security ; Asaas https://docs.asaas.com/docs/checkout-com-assinatura-recorrente .
