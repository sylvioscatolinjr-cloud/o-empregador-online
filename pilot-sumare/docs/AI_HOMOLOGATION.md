# Homologação isolada dos agentes de IA — 21/10/2026

## Validação atual — 21/10/2026, após correção das credenciais

- SUPABASE_SECRET_KEY e OPENAI_API_KEY configuradas em Preview, restritas a feature/oeo-ai-agents. Nenhum valor privado lido, retornado ou registrado.
- A primeira credencial Supabase fornecida era publishable; diagnóstico seguro confirmou permission denied (42501) em membership. Proprietário substituiu pela chave secreta; o erro deixou de ocorrer.
- Implantação verificada READY: dpl_EJ7BaUpoCepck6fvM2idAZUgiGL9, commit 2c033673b5d2f2a1d948e2e9eb1cc40dc7a9084c.
- Login real via Auth e isolamento de vínculos passaram em seis contas técnicas (duas por perfil). Cada conta leu apenas seu vínculo; acesso direto à tabela de pagamentos foi bloqueado.
- GET /api/ai?action=balance e POST /api/ai?action=chat passaram para learner, recruiter e school_staff, com resposta real OpenAI gpt-4.1-mini.
- Por perfil foi feita uma chamada: candidato 398→298 centavos sintéticos; empresa 1980→1880; instituição 1980→1880. SQL confirmou spent_cents=100 por perfil, total de três usos sintéticos. Houve consumo normal da API do provedor, sem cobrança Asaas nem pagamento real.
- Respostas inspecionadas: orientação de currículo sem inventar experiência, critérios profissionais de entrevista sob decisão humana e três módulos de curso sem dados de alunos.
- Acesso anônimo ao saldo retornou HTTP 401.
- Logs seguros da consulta de saldo mostram somente etapa, categoria de chave e código controlado de erro; nunca credencial, token, ID, pergunta ou currículo. Três testes unitários da consulta e build passaram após o ajuste.
- Não equivale a homologação visual/browser, confirmação/recuperação de email, planos por nível, persistência de conversas, nem liberação da produção. PILOT_EMAIL_ENABLED=false continua impedindo abertura da interface autenticada nesta prévia; PUBLIC_REGISTRATION_OPEN=false e ingresso fechados. Esses pontos permanecem pendentes.
- Finalidade e minimização preservadas: somente contas técnicas example.invalid e perguntas inventadas, sem dados de usuários reais enviados à OpenAI. Retenção/limpeza dos fixtures continua sob controle administrativo; período sintético expira após sete dias. Revisão LGPD permanece a descrita abaixo, sem certificação de conformidade integral.

## Estado inicial da preparação (histórico)
- Projeto Supabase: OEO Homologacao IA, `xxirjbsbfxwzplrcbbjt`, organização existente `dmrfruowhegmobthvxcs`, us-east-2. Cotação recebida: USD 0/mês.
- Branch Vercel: `feature/oeo-ai-agents`; produção preservada.
- Seis contas técnicas sintéticas no domínio reservado example.invalid: duas por learner/recruiter/school_staff. Não são as três contas reais do proprietário. Senhas aleatórias não registradas no repositório.
- Seis pagamentos exclusivamente sintéticos (`SYNTHETIC_TEST`, termos `SYNTHETIC-HOMOLOGATION-NO-PAYMENT`) no projeto isolado, vigência de sete dias; nenhum Asaas foi chamado.
- Ensaio SQL de reserva de 100 centavos, rejeição de reserva duplicada, estorno e repetição de estorno passou para as seis contas; transação revertida; soma spent_cents=0.
- Todas as tabelas públicas têm RLS. Advisor: INFO para tabelas deliberadamente sem políticas de cliente; WARN de proteção de senhas vazadas desativada. Cadastro público fechado e senhas de alta entropia nas contas sintéticas; não equivale a aprovação de abertura pública.
- Chamada OpenAI real e homologação do navegador continuam pendentes.

## Configuração da prévia
Variáveis abaixo preparadas somente para a branch indicada:
SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, PILOT_COHORT_ID, APP_ORIGIN,
PUBLIC_REGISTRATION_OPEN=false, PILOT_EMAIL_ENABLED=false,
AI_CHAT_MODEL=gpt-4.1-mini, AI_CHAT_METERING_ENABLED=true.
PILOT_EMAIL_ENABLED fica false: entrega/recuperação de email não foi homologada neste projeto. Não apresentar a interface de contas como liberada antes de verificar isso.

Pendentes, inseridas diretamente no painel, sem colar no chat:
1. SUPABASE_SECRET_KEY: chave secreta exclusiva de xxirjbsbfxwzplrcbbjt.
2. OPENAI_API_KEY: chave de testes com limite de uso.
Ambas em Preview, com Git Branch feature/oeo-ai-agents. Não usar a chave secreta do Supabase de produção.
Após inserção: redeploy da prévia e ensaio autenticado de /api/ai?action=chat e balance, com origem APP_ORIGIN. Validar resposta OpenAI e débito/estorno reais, depois isolamento entre as duas contas de cada papel. As senhas podem ser redefinidas administrativamente somente nas contas sintéticas do novo projeto caso a sessão local tenha expirado.

## Migrações e recusas
Foram aplicadas 25 das 28 migrações locais. Intencionalmente omitidas:
- 20261018022109_single_owner_cpf_duplicate_exception: revisão automática rejeitou relaxamento da unicidade de CPF; não necessário à homologação.
- 20261018024241_portal_web_push_notifications: revisão automática rejeitou cron que enviaria token ao domínio de produção; não necessário à homologação.
- 20261018024531_push_skip_inactive_recipients: depende da infraestrutura push omitida.
Não contornar essas recusas; não tratar o ambiente como réplica completa da produção.

## Privacidade
Finalidade: testar autenticação, isolamento e contabilização dos agentes. Dados mínimos: identificadores técnicos, emails example.invalid, papéis e saldos sintéticos; nenhuma cópia de currículos, CPF, CNPJ ou usuários reais. Não há novo tratamento de conteúdo pessoal de usuários nesta etapa; a hipótese legal do tratamento real deve ser definida e informada antes de habilitá-lo. Manter cadastro fechado, não enviar dados de pessoas aos provedores, e remover os fixtures ao encerrar a homologação. Saldo expira após sete dias; expiração não elimina automaticamente as contas técnicas. Acesso restrito ao administrador e aos respectivos usuários de teste; sem diretório público de credenciais.

Referências oficiais consultadas: LGPD arts. 6, 7, 9, 18 e 46, https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm ; Radar Tecnológico IA Generativa da ANPD, https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos/radar_tecnologico_ia_generativa_anpd.pdf .
Não representa certificação de conformidade jurídica integral.

## Interface de homologação — 21/10/2026

- Corrigido parser Bearer do catálogo: expressão antiga excluía a letra s e aceitava espaços. Regressão cobre tokens com s e espaços/tab/quebra de linha.
- publicPilotConfig mantém ready=false enquanto email não está homologado. Configuração separada aiPreview só existe com VERCEL_ENV=preview, AI_PREVIEW_LOGIN_ENABLED=true e cadastro público desabilitado. Não altera produção ou a regra geral de confirmação de email.
- Assistente oferece formulário restrito a contas existentes; sem cadastro nem recuperação. Sessões continuam sob Supabase Auth, e catálogo/saldo/chat verificam identidade, confirmação e vínculo ativo no servidor. E-mails/contas reais não foram copiados.
- Bloqueio de submit duplicado, saldo atualizado após falhas, resposta preservada caso saldo falhe, nova pergunta desabilitada quando saldo esgota ou não pode ser conferido. Respostas exibidas como texto, sem executar HTML. Saída precisa de confirmação do provedor.
- 144 testes passaram, zero falhas e um PDF privado ignorado; build aprovado. Quatro testes DOM novos cobrem sessão, entrada/saída, duplicidade, saldo insuficiente e falha de atualização, com respostas simuladas; não são testes de navegador com IA real.
- Navegador remoto abriu a interface antiga e confirmou o bloqueio. Verificação visual pós-publicação e sessão autenticada ainda não concluídas neste registro. BrowserAuth exige fluxo seguro para credenciais; nenhuma senha de teste foi digitada por automação de navegador.
- Revisão de privacidade: finalidade restrita a autenticar contas técnicas e testar UI, sem novo dado pessoal real ou compartilhamento. Config pública só contém URL e chave publicável; senhas ficam no fluxo Auth e são limpas do campo após envio. Dados sintéticos com limpeza administrativa conforme seção anterior. LGPD/ANPD oficiais consultadas novamente em 21/10; não representa certificação jurídica.

### Resultado observado após a publicação da interface

- Commit 87b49c4b3229a2a502fa2a876dbb8a5f3b8ad679, implantação dpl_DYE9AYSFwp1RGFUP52poRUXRJZ7s READY.
- Navegador remoto: formulário visível com título Homologação dos agentes de IA, campos Email da conta de teste/Senha e botão Entrar. Só a entrada sem sessão foi verificada visualmente.
- Ensaio de integração do módulo app/ai.mjs em DOM (linkedom), usando tokens de contas sintéticas autenticadas pela API e chamadas reais ao backend implantado: três perfis carregaram título correto, renderizaram resposta OpenAI e atualizaram o saldo. Dois eventos de submit seguidos produziram apenas uma chamada por perfil.
- Segundo candidato: 3→2 chamadas completas; segunda empresa: 19→18; segunda instituição: 19→18. Saldo inicial/fracionário preservado; débito de 100 centavos sintéticos por chamada. Perguntas somente inventadas sobre aprendizado.
- Este ensaio DOM/API não é prova de sessão autenticada em Chrome, layout móvel ou interação visual completa. Login, envio e logout autenticados no navegador continuam pendentes; orientação browserAuth impede digitação automatizada de credenciais pela ferramenta de navegador. Não foram solicitadas senhas em conversa nem criados atalhos de autenticação.
- Próximas etapas antes de produção: sessão autenticada no navegador, revisão móvel/acessibilidade, email/recuperação e limites por plano. Produção continua sem alteração.

## Isolamento de sessão no assistente — 21/10/2026

Problema reproduzido em dois testes de regressão: saída/expiração não limpava resposta já visível, e troca de conta durante uma chamada deixava a resposta antiga aparecer após retorno. Não foi observado vazamento de dados de usuários reais; reprodução usa somente texto sintético.

Correção: onAuthStateChange limpa a área privada quando a conta sai ou muda. Cada chamada captura identidade/revisão, confere a sessão novamente após o retorno e descarta respostas antigas; callback permanece síncrono e não chama Auth, evitando bloqueio do SDK. O formulário desmontado não dispara atualização de saldo adicional. Troca silenciosa antes do evento também é coberta por terceiro teste. Não cancela processamento nem estorna automaticamente uma chamada legitimamente iniciada pela sessão anterior; só impede sua exibição na sessão seguinte.

Validação: três regressões novas passam, sete testes DOM do assistente passam; bateria completa 147 aprovados, zero falhas, um PDF privado ignorado. Build aprovado. São testes DOM simulados, não ensaio autenticado de Chrome/celular. A limitação de sessão no navegador documentada anteriormente permanece.

Privacidade: finalidade de impedir exposição de conteúdo entre sessões; nenhuma coleta, envio ou retenção nova, nenhuma alteração de autorização/RLS ou créditos. A limpeza remove texto da página, sem afirmar revogação de tokens pelo servidor. Consultados LGPD arts. 6/46 e Radar Tecnológico da ANPD nas referências acima; callback conferido em https://supabase.com/docs/reference/javascript/auth-onauthstatechange . Não representa certificação jurídica integral.


## Revisão de largura estreita — 2026-10-21

A tela de entrada foi inspecionada em Chrome real dentro de iframe com larguras de 320, 375, 390 e 768 pixels. Em todas, clientWidth e scrollWidth coincidiram: sem transbordamento horizontal. Em 375 pixels, campos mediram 52 pixels de altura e botão 50 pixels. Esta evidência cobre somente a tela sem autenticação, não aparelho físico nem telas autenticadas.

A página `/revisao-interface.html` permite repetir a inspeção. O build copia essa página apenas quando VERCEL_ENV=preview. Builds Preview e padrão passaram; no padrão a página não foi incluída. Não houve nova alteração na lógica de cobrança ou autenticação.

Para concluir a navegação autenticada, falta uma conta no projeto de homologação cuja senha seja escolhida pelo usuário e inserida por ele no formulário seguro do navegador. As contas técnicas existentes têm senhas aleatórias; contas reais não foram copiadas. Após a criação, atribuir perfil e créditos sintéticos somente na homologação.

Privacidade: inspeção sem dados pessoais, perguntas ou credenciais na tela; sem envio de email ou pagamento. Mantidas as considerações de minimização e isolamento da LGPD e orientações ANPD registradas acima, sem declaração de conformidade integral.


## Chrome autenticado — 2026-10-21

Conta criada pelo responsável no Auth da homologação, e-mail confirmado, learner ativo e crédito sintético por sete dias. is_fictitious foi atribuído incorretamente na preparação e causou a recusa do saldo. Corrigido apenas nesse registro para false, sem relaxar regras de autorização. Após recarregar, Chrome mostrou Agente de Carreira e três chamadas completas. Pergunta com dados fictícios recebeu resposta; interface mostrou duas chamadas restantes. Banco confirmou 398 centavos de crédito, 100 gastos, 298 disponíveis. Nenhuma cobrança externa. Senha inserida por meio seguro, sem leitura pelo agente.

Na retomada seguinte, a aba anterior não estava disponível e a nova aba não possuía sessão. A entrada segura na revisão com iframe retornou erro de credenciais; inspeção autenticada nas larguras estreitas permanece não concluída. Não confundir com os testes já aprovados da entrada sem sessão ou do agente autenticado em desktop. Não foram copiados dados de produção.


## Revisão autenticada em larguras estreitas concluída — 2026-10-21

Após entrada manual do responsável, a página de revisão exibiu Agente de Carreira autenticado e duas chamadas completas. Foram selecionadas larguras 320, 375, 390 e 768 pixels no controle visível. Em todas, clientWidth igualou scrollWidth, sem transbordamento horizontal. Textarea: 280/335/350/728 pixels de largura e 154 de altura. Botões: 50 pixels de altura e larguras 236 e 198 pixels, cabendo na menor tela.

Resultado cobre a interface autenticada do Candidato, antes de nova resposta, em iframe de Chrome desktop. Não simula teclado virtual, toque ou aparelho físico. A resposta real e o débito já foram verificados na sessão desktop anterior. Nenhuma nova chamada ao modelo foi feita nesta revisão, mantendo duas chamadas completas disponíveis. Sem dados pessoais ou credenciais na evidência visual; conta e crédito continuam restritos à homologação.


## Empresa e Instituição no Chrome — 2026-10-21

Na mesma conta administrativa de teste da homologação, papel temporariamente alterado learner→recruiter→school_staff→learner e restaurado ao final. Nenhuma alteração de RLS ou de produção. Isto valida roteamento por papel em uma sessão; não substitui os testes anteriores de isolamento entre contas distintas.

Empresa abriu Agente de Gestão e Talentos; pergunta inventada sobre três critérios técnicos para estágio recebeu resposta, sem decisão sobre pessoas reais. Saldo visual 2→1 chamadas. Instituição abriu Agente de Evolução Educacional; pergunta inventada gerou três módulos de desenho mecânico, sem dados de alunos ou promessa de emprego. Saldo visual 1→0 chamadas; botão de envio desabilitado. SQL confirmou crédito=398, gastos=300 e disponível=98 centavos sintéticos, considerando também a chamada anterior de Candidato.

Resposta longa educacional conferida nas larguras selecionadas 320/375/390/768: larguras úteis 305/360/375/753 devido à barra vertical; scrollWidth igual a clientWidth em todas. Sem transbordamento horizontal. Empresa também conferida a 320. Não houve teste em aparelho físico, teclado virtual ou teste de chamadas dos três níveis pagos. Pagamento da conta continua sintético de plano Candidato; as alterações de papel não simulam compra de plano empresarial/educacional. Nenhum pagamento externo, credencial lida ou conteúdo pessoal enviado. Finalidade restrita, minimização e isolamento mantidos conforme referências LGPD/ANPD anteriores.
