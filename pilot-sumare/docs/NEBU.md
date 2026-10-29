# Nebu — assistente de ajuda do portal

Pedido do titular em 29/10/2026: uma assistente "Nebu" (bulldog francês fêmea, cabeça preta, corpo branco com manchas pretas) para orientar usuários perdidos sobre próximos passos e preenchimento de campos. Visual em SVG no estilo da Nebu da Super Maker (imagem enviada pelo titular em 29/10 à noite): sentada, cabeça preta, orelhas rosadas com lacinho, coleira azul-turquesa com medalhinha dourada.

## Como funciona (sem IA)

- `app/nebu.mjs` (bundle `dist/nebu.js`) é carregado nas páginas do portal e mostra um botão fixo no canto inferior direito.
- Ao abrir, a Nebu identifica a página e, em `/conta.html`, a tela visível (cadastro, entrar, confirmação, currículo, meta, área do candidato ou da empresa/instituição) e mostra próximos passos e dúvidas comuns (`src/nebu-guide.mjs`).
- Passos com atalho clicam no botão correspondente do menu só quando ele existe na tela.
- Ao focar um campo, a seção "Sobre este campo" explica para que ele serve (dicionário por nome do campo, com texto genérico a partir do rótulo).
- Um balão "Ficou com dúvida? Eu ajudo!" aparece uma vez por sessão para quem ainda não abriu a Nebu.

## Comportamento (pedidos do titular em 29/10/2026)

- Esperando no canto: pisca e mexe as orelhas.
- Farejar: campo "Pergunte à Nebu" com botão Farejar. Busca local (sem acentos, sinônimos e palavras parecidas) nas dúvidas, passos, campos e páginas do portal, e aponta botões e títulos da tela atual ("Mostrar"), destacando o elemento.
- Brincadeiras só com a tela parada (`app/nebu-idle.mjs`); qualquer tecla, toque, rolagem ou movimento volta tudo ao normal:
  - 30 s: às vezes (60%) traz a bolinha ou o frango de brinquedo para brincar de bobinho; o brinquedo sempre desvia do ponteiro ou do toque. Depois de 6 tentativas ou 20 s, "É meu!".
  - 1 min: um gato passa e ela corre latindo atrás.
  - 2 min: dorme (às vezes antes busca o pato de brinquedo e dorme junto). Dormindo, de 25 a 45 s: pum, ou o gato chega de mansinho, cutuca 3 vezes, ela acorda e corre atrás; depois volta a dormir.
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
