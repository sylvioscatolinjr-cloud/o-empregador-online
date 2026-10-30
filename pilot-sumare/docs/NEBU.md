# Nebu — assistente de ajuda do portal

Pedido do titular em 29/10/2026: uma assistente "Nebu" (bulldog francês fêmea, cabeça preta, corpo branco com manchas pretas) para orientar usuários perdidos sobre próximos passos e preenchimento de campos. Visual em SVG no estilo da Nebu da Super Maker (imagem enviada pelo titular em 29/10 à noite): sentada, cabeça preta, orelhas rosadas com lacinho, coleira azul-turquesa com medalhinha dourada.

## Como funciona (sem IA)

- `app/nebu.mjs` (bundle `dist/nebu.js`) é carregado nas páginas do portal e mostra um botão fixo no canto inferior direito.
- Ao abrir, a Nebu identifica a página e, em `/conta.html`, a tela visível (cadastro, entrar, confirmação, currículo, meta, área do candidato ou da empresa/instituição) e mostra próximos passos e dúvidas comuns (`src/nebu-guide.mjs`).
- Passos com atalho clicam no botão correspondente do menu só quando ele existe na tela.
- Ao focar um campo, a seção "Sobre este campo" explica para que ele serve (dicionário por nome do campo, com texto genérico a partir do rótulo).
- Um balão "Ficou com dúvida? Eu ajudo!" aparece uma vez por sessão para quem ainda não abriu a Nebu.

## Comportamento (pedidos do titular em 29/10/2026)

- Fica solta no canto inferior direito, sem moldura, por cima da página (só a figura recebe cliques). Esperando, pisca e mexe as orelhas.
- Farejar: campo "Pergunte à Nebu" com botão Farejar. Busca local (sem acentos, sinônimos e palavras parecidas) nas dúvidas, passos, campos e páginas do portal, e aponta botões e títulos da tela atual ("Mostrar"), destacando o elemento.
- Nas correrias e passeios, Nebu e gato andam pela tela toda (3 rotas que se alternam) e a Nebu deixa pegadas que somem em 3,5 s.
- Brincadeiras só com a tela parada (`app/nebu-idle.mjs`); qualquer tecla, toque, rolagem ou movimento volta tudo ao normal:
  - 15 s: passeia pela parte de baixo da tela, fareja ("snif snif") e volta ao canto.
  - 30 s: às vezes (60%) traz a bolinha ou o frango de brinquedo para brincar de bobinho; o brinquedo sempre desvia do ponteiro ou do toque. Depois de 6 tentativas ou 20 s, "É meu!".
  - 1 min: um gato passa e ela corre latindo atrás.
  - 2 min: dorme (às vezes antes busca o pato de brinquedo e dorme junto). No primeiro cochilo o gato sempre vem, cerca de 25 s depois de ela dormir (uns 2 min 25 s sem mexer na tela). Nos cochilos seguintes, de 25 a 45 s: pum, ou o gato chega de mansinho e, desconfiado, cutuca 3 vezes com um galho ("toc"); ela acorda e corre atrás; depois volta a dormir.
  - 45 s e 1 min 30 s: uma das 5 brincadeiras extras, em rodízio (sem sorteio): borboleta que pousa e ela pula latindo ("Au! Au!"); bolhas de sabão que ela estoura ("pop!"); zoomies, a corrida maluca pela tela com pegadas ("Zuuum!"); enterrar o osso ("cava, cava", deixa um montinho de terra); petisco que cai do céu ("Nhac!").
- Com "reduzir movimento" ligado no aparelho, só o soninho, sem correria.
- As cenas são decorativas (aria-hidden) e não bloqueiam cliques, exceto o brinquedo do bobinho.

## LGPD

- Finalidade: orientação de uso do portal.
- Dados: nenhum dado pessoal é coletado, lido para envio ou transmitido. A pergunta do Farejar é processada só no navegador. Os textos são fixos no navegador; o conteúdo dos campos não é lido, só o nome e o rótulo do campo focado.
- Armazenamento: apenas a marca técnica `nebu-seen` em `sessionStorage` (sem dado pessoal), apagada ao fechar o navegador.
- Fornecedores: nenhum. Sem chamadas de rede.
- Por isso não há mudança na Política de Privacidade nesta etapa.

## Decisão do titular (29/10/2026)

As respostas da Nebu não usam IA: é um sistema autônomo e gratuito, com conteúdo fixo e busca local. Novas dúvidas entram editando `src/nebu-guide.mjs` (FAQ por página, `places`, `fields` e `synonyms`).


## Ajuda para dificuldades — 30/10/2026

Autorização do titular: manter a Nebu gratuita e sem modelo de IA pago. A busca agora prioriza relatos de falha em candidatura, pagamento, acesso e salvamento; casos ambíguos pedem a etapa. Não confirma operações nem consulta dados da conta. Pagamentos orientam conferir a compra e não pagar novamente. Formulários orientam preservar textos antes de atualizar. A interface usa “Vamos verificar” em dificuldades, sem resultados de navegação genéricos ou anúncio de sucesso.

Validação local: seis testes focados aprovados e sintaxe do widget conferida. Prévia/produção e testes dentro dos três perfis ainda precisam confirmação; não representar testes locais como validação integral.

Privacidade: mesma finalidade de orientação, sem transmissão, fornecedor, nova coleta ou persistência. Pergunta só em memória do navegador; não registrar texto nem conteúdo de formulários. Links de navegação e e-mail permanecem acionados pelo usuário. Não pedir senha, CPF, códigos ou dados bancários. Não há nova hipótese de tratamento no servidor; demais bases/direitos da política permanecem. Revisão das referências oficiais LGPD/ANPD tentada nesta sessão, mas indisponível na ferramenta de consulta; não alegar revisão jurídica ou conformidade integral. Referências já adotadas: LGPD, arts. 6 e 46, e Guia de Segurança da Informação para Agentes de Tratamento de Pequeno Porte da ANPD.
