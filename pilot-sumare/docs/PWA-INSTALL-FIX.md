# Instalação no celular — correção de fluxo, 22/10/2026 (Brasília)

## Problema e comportamento
Titular relatou que Baixar app apenas rolava para instruções, sem conseguir instalar. O fallback em instalar.html usava âncora #instrucoes; não havia ação nativa disponível sem beforeinstallprompt, e a instrução não incluía o submenu atual do Chrome Android.

A página passa a mostrar o passo a passo imediatamente, com seleção Android/iPhone e botão Copiar endereço para abertura no navegador do aparelho. Chrome Android: menu ⋮, Instalar e criar atalho, Instalar; nomes alternativos também são explicados. iPhone/iPad: Safari, Compartilhar, Adicionar à Tela de Início. É informado que Criar atalho isoladamente não comprova instalação completa.

O botão Instalar app neste aparelho fica oculto até o navegador fornecer beforeinstallprompt. Quando disponível, um clique chama o prompt nativo, consumido uma vez; cancelamento/falha leva a instrução explícita, sem declarar instalação concluída. appinstalled confirma sucesso e troca para acesso à conta. Dois cliques não consomem o mesmo evento, e resposta tardia da janela não sobrescreve sucesso. Instalado em modo standalone permite abrir o espaço. Navegadores internos recebem orientação para abrir no Chrome/Safari, sem prometer que um link consiga forçar essa troca.

Não é possível obrigar todos os navegadores a fornecer janela de instalação via JavaScript. A nova tela distingue instalação direta, caminho manual e atalho; não cria botão inoperante nem promete APK/loja. Marca, identidade do manifesto, ícones e padrão visual são preservados. Não foi alterado o service worker, push ou cache privado.

## Verificação
Suíte geral: 283 aprovados, zero falhas, um PDF privado ausente ignorado. Seis testes focados aprovados: janela nativa, cancelamento, modo instalado, Android/iPad, seleção manual, Clipboard indisponível, clique duplicado, confirmação concorrente e privacidade offline. Build aprovado. Produção respondeu 200 para manifesto application/manifest+json, service worker application/javascript e ícones 192/512 image/png. Manifesto tem scope /, id /, display standalone e PNGs nas dimensões corretas. Disponibilidade técnica desses arquivos não prova instalação no aparelho. Navegador local continua sem Chromium; aceite real Android/iOS permanece pendente após publicação.

## Privacidade e continuidade
Finalidade: corrigir instalação solicitada. Tipo de aparelho inferido localmente do user agent e toque apenas para escolher instrução inicial; seleção manual disponível, sem guardar ou enviar essa informação. Clipboard recebe somente endereço público do portal mediante clique, sem leitura da área de transferência. Sem novos cookies, armazenamento, analytics, terceiros, acesso, dados financeiros ou dados de currículo. Hipótese e retenção do serviço existente preservadas; sem nova coleta persistente ou certificação jurídica integral. Cache continua contendo somente página offline genérica; APIs e dados pessoais não são armazenados. Não houve compra, geração de IA, mensagem ou alteração de conta.

Histórico de aceite: titular confirmou envio, publicação e abertura real de PDF nos três públicos. PPTX, link externo e senha adicional continuam pendentes. A instalação no celular teve falha real nesta rodada e só será aprovada após nova tentativa no aparelho.

Fontes oficiais consultadas: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event ; https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=pt-BR ; https://support.apple.com/guide/iphone/turn-a-website-into-an-app-iph42ab2f3a7/ios ; https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm ; https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-vf.pdf .

## Simplificação após nova tentativa do titular
A seleção Android/iOS ainda foi percebida como início da instalação, mas só alternava instruções. Removida a seleção. O botão nativo agora permanece visível com estado Instalação direta indisponível e desabilitado quando o navegador não fornece o prompt; é habilitado como Instalar app neste aparelho quando o evento chega. Na inicial, sem prompt, o rótulo passa a Como instalar o app. Instrução é escolhida localmente pelo aparelho, sem pedir uma seleção que pareça iniciar instalação. Não foi criado botão que force menu/janela do navegador sem suporte. Seis testes focados e build aprovados; instalação real permanece pendente. Mesma finalidade, dados mínimos e retenção; fontes LGPD/ANPD e guia Chrome revistas novamente.
