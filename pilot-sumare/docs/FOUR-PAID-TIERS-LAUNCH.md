# Quatro níveis pagos e venda real — 25/10/2026

## Autorização e tabela
Titular autorizou quatro níveis pagos além do gratuito, novos treinamentos para os três perfis, cashback 20/25/30/30% e abertura de vendas para lançamento em 05/11/2026. A grafia 299,09 foi tratada como 299,90 conforme a proposta explicitamente aprovada.

| Perfil | Nível 1 | Nível 2 | Nível 3 | Nível 4 |
| --- | --- | --- | --- | --- |
| Candidato | 19,90 | 39,90 | 69,90 | 99,90 |
| Empresa | 99,90 | 299,90 | 699,90 | 999,90 |
| Instituição | 99,90 | 299,90 | 699,90 | 999,90 |

Valores em reais por mês. Pacotes trimestral/semestral/anual preservam descontos de 10/20/30%. Cashback é crédito virtual para uso de IA, calculado sobre o valor efetivamente pago do período, arredondado ao centavo, com validade do ciclo e sem saque/acúmulo. Nível4 mensal: 29,97 para candidato, 299,97 para empresa/instituição. Não há concessão por escolha visual ou simples retorno do checkout.

## Contratos e proteção financeira
Nova versão de contratação: 2026-10-25-four-tiers-v1. Ordens/pagamentos anteriores não foram atualizados; guardam valor e crédito originais. A verificação JS e a função privada de prioridade reconhecem as duas tabelas, sem recalcular contratos antigos pela nova. Não há troca automática de nível nem cobrança em nome do titular.

Compra liberada para contas reais learner/recruiter/school_staff ativas, confirmadas, não fictícias/não bloqueadas, com senha novamente conferida, consentimento, termos vigentes, lista de cursos desejados e configuração financeira pronta. Papel real, preço e cashback são fixados no servidor; parâmetros do navegador não concedem perfil ou benefício. O modo proprietário continua usando acesso administrativo privado para testes, sem mudar a identidade da compra.

PUBLIC_SUBSCRIPTIONS_ENABLED=true em Production autoriza novas contratações públicas. false + redeploy pausa novos checkouts públicos, preservando consulta, conciliação, cancelamento e períodos pagos; proprietário mantém validação privada. Não reverter para código que desconhece nível4 após aceitar pagamentos. Não reduzir constraints nem apagar lançamentos. Recargas Pix/cartão e custos de IA continuam iguais; assinaturas recorrentes usam cartão Asaas. Abertura não liga Pix Automático, publicação automática ou aprovação institucional do piloto SENAI.

## Treinamentos
Nove oficinas originais novas, quatro aulas, atividade prática e cinco perguntas explicadas cada:
- Candidato: decisões profissionais e propostas; resolução de problemas e melhoria; aprendizagem aplicada e demonstração de competência.
- Empresa: planejamento de equipe/capacidade; uso responsável de IA na seleção; experimentos de atração e retenção.
- Instituição: funil de captação à matrícula; campanhas/publicações para preencher turmas; viabilidade de cursos.

Total original:36 treinamentos,144 aulas,180 perguntas. Nível4 acessa12 por perfil; níveis inferiores continuam3/6/9. Sem certificado/pontos automáticos, serviço humano dedicado ou publicação social prometidos. Desafios de IA são opcionais e dependem do preço/consentimento normal. Conteúdo e gabarito ficam no serviço; catálogo público contém somente metadados. Proprietário também cadastra PDF/PPTX/link de nível4 no gerenciador, mantendo senha/acesso privados.

## Banco e validação
Migração de produção20261025034344_four_paid_tiers_launch: expansão aditiva de constraints nas ordens reais, seleção de planos e biblioteca; atualização de pilot_private.verified_paid_tier invoker/service-only. Sem tabela, grant público ou SECURITY DEFINER novo. RPC legado portal_ai_paid_reserve não é usado pelos endpoints atuais da carteira e não foi ampliado.
- Matriz48 preços/períodos e conversões testada; rotas de compra dos três perfis rejeitam preço/perfil/crédito forjados e termos antigos.
- Testes de contrato legado, plano4, acesso pago4/negação a3 e pausa operacional.
- Ensaio hospedado com usuários/turma sintéticos e rollback: três perfis4,30% exatos, confirmação duplicada sem crédito extra, isolamento e estorno. Zero usuários/turmas de teste persistidos; zero compra real criada nessa validação.
- Asaas conectado/conta aprovada/webhook pronto verificados no registro de produção.
- Advisors sem novo WARN/ERROR; aviso anterior de proteção contra senha vazada permanece.
- Chromium153:30 combinações de catálogo/planos e larguras320/375/675/1024/1280, sem transbordamento/clipping e sem mudança de tamanho ao selecionar. Componentes reais com dados fictícios; não substitui aparelho/sessão reais.
- Build aprovado e suíte geral:380 testes aprovados, zero falhas, um teste ignorado pela ausência de PDF privado (381 total).25 testes focados finais aprovados. Fornecedores pagos não foram acionados por teste/build novo; nenhuma renovação/cancelamento/estorno financeiro real feito para validar.

## Privacidade e transparência
Finalidade contratual de compra e entrega de benefícios (referência LGPD art.7,V), conferência financeira e prevenção de duplicidade; mesmos identificadores, perfil, preço, pedido, situação e período já tratados. Progresso novo permanece privado e removível; rascunho não é enviado automaticamente. Nenhuma nova categoria de dados pessoais ou fornecedor. Acesso financeiro service-only, autorização real de perfil e turma preservados. Valores de chaves, cartão, senha e conteúdo privado não entram em logs/evidências. Registros financeiros mantêm política/atendimento/direitos anteriores; não há nova purga ou prazo arbitrário. Termos e Política de Privacidade atualizados no mesmo PR; contratos anteriores preservados. Documentos legais continuam preliminares nos campos que já exigem preenchimento/revisão; não se declara certificação jurídica ou conclusão integral do projeto.

Fontes oficiais revistas: LGPD no Planalto, guia de segurança da ANPD, Supabase RLS/changelog e Asaas Checkout recorrente. Preços, limites e entrega informados antes de contratar. Primeira compra real da nova tabela e cobrança/renovação externa não foram simuladas como recebimento.
