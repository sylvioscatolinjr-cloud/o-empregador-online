# Política, Termos, limpeza do protótipo e indicadores do negócio — 25/10/2026

## O que mudou

- **Política de Privacidade** (`/privacidade.html`) e **Termos de Uso** (`/termos.html`) publicados a partir das minutas revisadas pelo titular em 24/10. Ambos exibem "Versão preliminar" e destacam (`class="pendente"`) os campos ainda não definidos: razão social, CNPJ, endereço, encarregado (DPO), e-mails de contato, provedor de e-mail, prazos de retenção a confirmar, cláusulas-padrão com fornecedores, caminho de exclusão de conta, Lei 15.211/2025, canal de atendimento e foro. As páginas mantêm `noindex` enquanto o site inteiro estiver fora de indexação.
- Links para os dois documentos: rodapé da página inicial, rodapé de conta, carteira, assinatura, publicações e assistente, tela de login, cadastro (aviso acima do botão) e confirmação de compra de recarga.
- Removidos: proxy `/laboratorio` para o site externo do protótipo (respondia 404), a página pública `plataforma.html` ("Área de testes", "Sandbox") e a frase "Não é necessária uma conta ChatGPT". `/laboratorio`, `/laboratorio/*` e `/plataforma.html` redirecionam para `/`. Links "Explorar plataforma" saíram do blog e da lista de cursos. `share-core` aceita apenas a raiz como base de link.
- **Indicadores do negócio** no Painel do proprietário (`GET /api/owner?view=business&period=…`): assinantes ativos por perfil e nível, MRR atual, receita confirmada no período (assinaturas e recargas), novas assinaturas, cancelamentos, execuções de IA cobradas/devolvidas e imagens geradas. O antigo cartão "Receita real" (sempre R$ 0,00 na função do banco) foi substituído por essa seção.

## Limites

- Receita usa pagamentos com `eligible=true` e a data `checked_at` (conferência no servidor), não a data de liquidação no Asaas. Inclui compras do proprietário.
- O painel lê até 10.000 linhas por tabela e avisa quando atinge o limite. Sem migração nova: as leituras usam a chave de servidor, e só depois de confirmar `pilot_owner` ativo.
- Os textos legais não substituem revisão por advogado. Publicar com campos pendentes torna a informação visível, mas não completa as obrigações (Decreto 7.962/2013 exige identificação do fornecedor no site).
- Assinaturas públicas e indexação continuam fechadas; esta mudança não as abre.

## Privacidade (LGPD/ANPD)

Finalidade: transparência ao titular (LGPD arts. 6º, VI, 9º) e gestão do negócio pelo controlador. Os indicadores retornam só contagens e valores agregados, sem identificador, e-mail, documento ou conteúdo de IA; nenhuma coleta, tabela, fornecedor ou retenção nova. Acesso limitado ao proprietário verificado no servidor. Remoção do proxy externo reduz envio de navegação a terceiros. Fontes: LGPD (planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm), Decreto 7.962/2013 e guias da ANPD (gov.br/anpd). Não constitui certificação jurídica.

## Evidência

Build aprovado; suíte completa 358 aprovados, 0 falhas, 1 ignorado (PDF privado ausente), 359 no total. Três testes novos em `tests/owner-business.test.mjs`.
