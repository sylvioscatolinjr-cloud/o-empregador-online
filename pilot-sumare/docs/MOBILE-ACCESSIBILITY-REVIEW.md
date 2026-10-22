# Revisão técnica de celular e teclado — 22/10/2026 (Brasília)

## Alterações
- Página inicial, conta, assistente, treinamentos e assinatura: atalho de teclado Pular para o conteúdo, alvo único no main e zoom do navegador preservado. Menus de assistente/treinamentos recebem nome acessível.
- Trocar de seção na conta move o foco para seu título; leitor de tela pode identificar a nova seção e o teclado mantém um ponto de entrada definido.
- Feedback de erro usa alert/assertive; confirmação usa status/polite, com mensagem atômica. Não são criados avisos ou envios externos.
- Operações da conta restauram somente o estado anterior dos botões da mesma tela. Botões novos mantêm seu próprio disabled. Corrige o reativamento indevido de Anterior/Próxima e controles dependentes de estado após renderização ou erro. Autorização continua no servidor.
- Colunas de formulário usam minmax(0,1fr), fieldsets/controles podem encolher, títulos e controles quebram textos longos. Campos móveis usam 1rem; labels de checkbox/radio têm área mínima de 44 px. Padrão roxo/turquesa, dimensões dos cards de IA entre estados, interrogações, numeração e controles de treinamento preservados.
- Preferência de movimento reduzido desliga a rolagem suave da página inicial. Pausa inicial e controles dos carrosséis existentes permanecem.

## Evidência e limites
32 testes focados de conta, perfil, formulários, IA/treinamentos e histórico aprovados; build aprovado. Inspeção DOM das cinco páginas compiladas verificou alvo de atalho único e ausência de bloqueio de zoom. Teste de regressão reproduziu botões desabilitados preservados após erro e em painel recém-renderizado, e conferiu mudança entre status e alert.

Suíte geral: 275 aprovados, zero falhas, um PDF privado ausente ignorado. Navegador local sem binário; download do Chromium retornou arquivo inválido e não permitiu execução visual. Inspeção de CSS/DOM não comprova ausência de transbordamento em todas as larguras, comportamento no iOS/Android ou compatibilidade com leitor de tela real. Permanecem testes visuais em 320/375/768 px, zoom de 200/400%, Tab/Shift+Tab, VoiceOver/TalkBack/NVDA, foco, seleção estável de IA e acesso a anexos. Esta entrega não certifica conformidade integral WCAG.

## Privacidade
Finalidade: acesso e uso mais claros do serviço existente. Sem novos dados coletados, compartilhamentos, tabelas, cookies, armazenamento, retenção ou mudança de hipótese de tratamento. CPF, currículo, financeiro e senhas não foram usados para teste. Fixtures sintéticas; sem login real, chamada OpenAI/Asaas, envio de aviso ou alteração de plano. Acessos, consentimentos, RLS e bloqueio da contratação pública preservados. Direitos e canais existentes permanecem. Risco de regressão de navegação mitigado por testes funcionais; revisão visual e de tecnologias assistivas permanece explícita.

Fontes oficiais revistas: LGPD https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm ; ANPD https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-vf.pdf ; W3C Reflow https://www.w3.org/WAI/WCAG22/Understanding/reflow.html e Status Messages https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html .
