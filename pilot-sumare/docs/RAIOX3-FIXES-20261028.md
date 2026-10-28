# Correções do Raio-X 3 — 28/10/2026

| Item | O que mudou | Onde |
|---|---|---|
| Commits direto no main | AGENTS.md reforçado; proteção do branch é ação do titular no GitHub | AGENTS.md |
| Indexação (oportunidade 1) | `/vaga/<id>`, sitemap, robots, JobPosting/Course | SEO-PUBLIC-LISTINGS.md |
| Pix nas assinaturas (2) | Período avulso por Pix, sem renovação | BILLING_LIVE.md |
| Afiliados (3) | Candidato R$ 200/200; organizações R$ 4.000/1.000; carência de 30 dias | AFFILIATE-PROGRAM.md |
| Turbinar para instituições (4) | Modelo de campanha de matrícula com estimativa; aviso ao proprietário quando há campanha para aprovar | TURBINAR-STATUS.md, `app/turbinar.mjs`, `src/campaign-handler.mjs` |
| Painel Negócio (5) | Conversão por perfil (cadastros → pagantes) e números do Turbinar | `src/owner-business.mjs` |
| CEP aberto | Limite de 30 consultas por minuto por IP e cache de 1 dia | `api/config.mjs` |
| Estado civil | Campo removido do currículo e da Política | `src/resume-model.mjs`, `app/resume-wizard.mjs` |
| CSP | Política aplicada (antes só relatório); 17 páginas conferidas sem violação | `vercel.json` |
| Documentação | Resumo das regras atuais | REGRAS-EM-VIGOR.md |

## Registro LGPD
- Finalidade e base: divulgação de anúncios (contrato), cobrança por Pix (contrato), contagem de afiliados com carência (contrato), aviso interno ao proprietário (legítimo interesse operacional, só título e código da campanha).
- Minimização: estado civil deixou de ser coletado; páginas públicas sem CEP/endereço/publicador; afiliado continua vendo só números; painel do proprietário só agregados.
- Transparência: Política seções 2, 4 e 8 e Termos seções 5, 9 e 10 atualizados; versão segue preliminar.
- Valores antigos de estado civil já gravados deixam de ser mostrados e compartilhados, e são apagados na próxima vez que a pessoa salvar o currículo.
- Fontes: Lei 13.709/2018 (arts. 6º, 7º, 9º, 18), orientações ANPD já citadas nos documentos do Turbinar e afiliados. Não constitui parecer jurídico.

## Pendências do titular
Aplicar a migração de afiliados antes do merge; ligar proteção do `main` no GitHub; enviar o sitemap ao Google Search Console depois do merge; provedor de e-mail (SMTP), encarregado (DPO), tributação dos prêmios e revisão do advogado.
