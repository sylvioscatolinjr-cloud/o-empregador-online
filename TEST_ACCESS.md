# Acesso ao protótipo por link

Em 15/10/2026, o proprietário solicitou abrir o protótipo para compartilhar o endereço somente com testadores. O modo de hospedagem solicitado é público: qualquer pessoa com o endereço pode abrir e repassar o link. Isso não constitui controle de acesso dos participantes.

A interface continua demonstrativa e usa pessoas e organizações fictícias. Cada navegador mantém os seus exemplos, edições e anexos locais; liberar o link não implanta contas reais compartilhadas, envio de e-mails ou backend multiusuário. Os dados e anexos previamente salvos no servidor continuam exigindo autenticação, e os controles administrativos reais continuam independentes do acesso à página.

A página usa `meta robots` e os recursos estáticos usam `X-Robots-Tag: noindex, nofollow`, orientando buscadores compatíveis a não indexar o conteúdo. Essas diretivas não impedem acesso direto, compartilhamento do endereço ou rastreadores que as ignorem. Não adicionar um `Disallow: /` que impeça o buscador de ler a diretiva noindex.

Validação: `tests/server.mjs` cobre página anônima com noindex e recusa de acesso anônimo ao estado, currículo e sessão administrativa reais. `tests/private-demo.cjs` cobre os fluxos de demonstração sem chamadas reais à API; `tests/pwa-ui.cjs` cobre a navegação. A conferência visual em navegador não estava disponível nesta execução.
