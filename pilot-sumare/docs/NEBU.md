# Nebu — assistente de ajuda do portal

Pedido do titular em 29/10/2026: uma assistente "Nebu" (bulldog francês fêmea, cabeça preta, corpo branco com manchas pretas) para orientar usuários perdidos sobre próximos passos e preenchimento de campos. Visual desenhado em SVG a partir das fotos da Nebu real enviadas pelo titular.

## Como funciona (etapa 1, sem IA)

- `app/nebu.mjs` (bundle `dist/nebu.js`) é carregado nas páginas do portal e mostra um botão fixo no canto inferior direito.
- Ao abrir, a Nebu identifica a página e, em `/conta.html`, a tela visível (cadastro, entrar, confirmação, currículo, meta, área do candidato ou da empresa/instituição) e mostra próximos passos e dúvidas comuns (`src/nebu-guide.mjs`).
- Passos com atalho clicam no botão correspondente do menu só quando ele existe na tela.
- Ao focar um campo, a seção "Sobre este campo" explica para que ele serve (dicionário por nome do campo, com texto genérico a partir do rótulo).
- Um balão "Ficou com dúvida? Eu ajudo!" aparece uma vez por sessão para quem ainda não abriu a Nebu.

## LGPD

- Finalidade: orientação de uso do portal.
- Dados: nenhum dado pessoal é coletado, lido para envio ou transmitido. Os textos são fixos no navegador; o conteúdo dos campos não é lido, só o nome e o rótulo do campo focado.
- Armazenamento: apenas a marca técnica `nebu-seen` em `sessionStorage` (sem dado pessoal), apagada ao fechar o navegador.
- Fornecedores: nenhum. Sem chamadas de rede.
- Por isso não há mudança na Política de Privacidade nesta etapa. Se a pergunta livre com IA for ligada, ela envia texto à OpenAI e exige atualizar a Política e os Termos no mesmo PR.

## Pendente

- Pergunta livre com IA: aguarda decisão do titular sobre cobrança (grátis com limite diário, sem pergunta livre, ou R$ 1,00 por uso).
