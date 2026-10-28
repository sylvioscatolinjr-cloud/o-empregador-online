# Indexação e páginas públicas de anúncios — 28/10/2026

`/sitemap.xml` e `/vaga/<id>` são servidos por `api/ai.mjs` (`action=sitemap` e `action=public-listing`), usando `src/public-pages.mjs`, por causa do limite de 12 funções da Vercel Hobby.

- Sitemap: `/`, `/blog.html` e anúncios do feed público ordenado (`portal_ordered_public_feed`), sem fictícios. Cache de 1 hora na borda.
- Página do anúncio: mesmas regras do feed (publicado, organização ativa, vaga só de empresa, e-mail confirmado, conta não bloqueada). Remove `publisher_id`, CEP, endereço, turma e logo em base64. JSON-LD `JobPosting` para vagas e `Course` para cursos, com `<` escapado. Encerrado ou inexistente: 404 com `noindex`. Fictício: `noindex`.
- `vercel.json`: `X-Robots-Tag: noindex` em todos os caminhos exceto `/`, `index.html`, `blog.html`, `vaga/`, `sitemap.xml`, `robots.txt` e arquivos estáticos. Termos e Política continuam `noindex` enquanto preliminares.
- `robots.txt` aponta o sitemap. Depois do merge, enviar o sitemap no Google Search Console (ação do titular).

LGPD: anúncios já eram públicos por link; a mudança amplia o alcance para buscadores. Finalidade: divulgação da vaga ou curso pedida por quem publicou (execução de contrato, art. 7º, V). Minimização: só campos já exibidos no feed, sem endereço/CEP nem dados do publicador; candidatos nunca indexados. Transparência: Política seção 4. Fonte: Lei 13.709/2018, arts. 6º e 7º; guia ANPD de legítimo interesse consultado no Turbinar. Não é parecer jurídico.
