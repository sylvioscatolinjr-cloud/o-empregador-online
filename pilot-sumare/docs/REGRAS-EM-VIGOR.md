# Regras em vigor (resumo de 28/10/2026)

Este arquivo lista só o que vale hoje. O histórico de cada decisão continua em `PROJECT_REQUIREMENTS.md` e nos documentos citados. Quando uma regra mudar, atualize este resumo no mesmo PR.

## Publicação
- Nada vai direto ao `main`: branch, pull request, prévia da Vercel e só então merge (AGENTS.md).
- Mudança de cobrança, banco ou texto legal exige PR com descrição do que testar. Migração de banco é aplicada no Supabase antes do merge e anotada no PR.
- Textos legais: `app/privacidade.html` e `app/termos.html`, marcados como versão preliminar até revisão do advogado.

## Planos e pagamentos
- Quatro níveis pagos mais Grátis. Candidato R$ 19,90/39,90/69,90/99,90; Empresa e Instituição R$ 99,90/299,90/699,90/999,90 por mês. Pacotes trimestral −10%, semestral −20%, anual −30%. Cashback em créditos de IA 20/25/30/30% (FOUR-PAID-TIERS-LAUNCH.md).
- Assinatura no cartão renova sozinha. Assinatura por Pix paga um período, sem renovação; desligável com `SUBSCRIPTION_PIX_ENABLED=false` (BILLING_LIVE.md).
- IA em todos os planos a R$ 1,00 por execução; recargas R$ 10/25/50 sem validade; Premium R$ 2,50 (HYBRID-AI-WALLET.md, PREMIUM-EXTERNAL-RESEARCH.md).

## Divulgação
- Destaques pagos separados do Turbinar.
- Turbinar: R$ 0,05 por destinatário, só saldo de recargas, aprovação do proprietário, que recebe aviso na central quando uma campanha é solicitada. Instituições têm modelo de campanha de matrícula, sem preço novo (TURBINAR-STATUS.md).

## Afiliados (AFFILIATE-PROGRAM.md)
- Conta cada pagamento confirmado de plano trimestral do indicado, depois de 30 dias de carência. Cancelamento ou pedido de cancelamento nesses 30 dias retira o pagamento.
- Candidato: R$ 200 por Pix a cada 200 pagamentos.
- Empresa e instituição: equipamento de até R$ 4.000 a cada 1.000 pagamentos.

## Busca e privacidade
- Indexáveis: `/`, `/blog.html`, `/vaga/<id>` e `sitemap.xml`. Todo o resto recebe `noindex`, inclusive Termos e Política enquanto preliminares (SEO-PUBLIC-LISTINGS.md).
- Currículos e perfis de candidatos nunca vão para buscadores.
- Estado civil não é coletado no currículo.
- CSP aplicada (não só relatório) em `vercel.json`.
- Consulta de CEP limitada a 30 por minuto por IP.
