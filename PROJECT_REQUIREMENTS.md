# O Empregador Online — contrato de continuidade e revisão de produção

Revisão de 17/10/2026 (Brasília). Origem: histórico disponível e recuperado, implementação em `pilot-sumare`, testes e documentos do protótipo. Não confundir funcionalidades da demonstração em `web/` com funcionalidades reais em `pilot-sumare/`. Este levantamento não significa que todo o backlog esteja implementado.

## Regras permanentes

- Atualizações somam ao produto. Não remover funções, detalhes visuais ou regras existentes por simplificação. Conferir este arquivo e as fontes abaixo antes de alterar; testar o impacto além do trecho editado.
- Cadastro começa escolhendo Candidato, Empresa ou Instituição de Ensino. Candidato exige CPF; demais perfis, CNPJ. E-mail confirmado e documento conferido no servidor; formato não comprova identidade. A escolha inicial é uma intenção, nunca autoridade de acesso. Papéis e permissões vêm do banco. Proprietário não é opção de cadastro.
- Cadastro público de testes dispensa aprovação manual e convite. Não reativar contas suspensas. Liberação pública não altera aprovações específicas do piloto SENAI.
- Sair da conta retorna à página inicial somente após a confirmação de saída. Não mostrar saída bem-sucedida se o provedor falhar.
- Separação estrita de candidato, empresa, instituição e proprietário. Nenhuma área demonstrativa pode conceder permissões reais.
- Preservar logo aprovado, cores roxa/turquesa e marcação Fictício nos registros sintéticos. 50 candidatos, 50 empresas com vagas, 50 instituições com cursos/idiomas; contas sem login, dados no banco, excluídos das métricas reais.
- Três carrosséis de destaques em espaço fixo: troca de 5 segundos, anterior/próximo, pausa/retomada. Navegação manual pausa; interação e aba oculta suspendem; preferência por redução de movimento inicia pausado. Todos os registros devem continuar acessíveis pelo rodízio.
- Recursos de demonstração não são cobrados nem apresentados como operação real. Pagamento real e publicação editorial automática não podem ser ligados apenas para completar uma tela.

## Inventário: produção e lacunas

| Combinado | Estado após esta revisão | Evidência / trabalho restante |
|---|---|---|
| Escolha inicial de perfil, manutenção da intenção após confirmação | Corrigido nesta publicação | `app/app.mjs`, `src/account-access.mjs`; metadado não concede papel |
| CPF/CNPJ, e-mail confirmado, unicidade e papel no servidor | Integrado | `profile-registration`, `registration-identity`, migrações de identidade/admissão |
| Logout para início | Corrigido nesta publicação | Redirecionamento após signOut confirmado; teste DOM |
| Currículo manual privado e cartão público com consentimento | Integrado | Repositórios, RLS e tela de candidato |
| Ajuda ? nos campos e impressão com Voltar | Restaurado nesta publicação | Ajuda por campo; impressão do currículo salvo; retorno ao formulário |
| Upload PDF/DOCX/escaneado com preenchimento revisável | Integrado; leitura local, revisão e anexo privado | Parser e extratores em `web/`; não importar dados privados do protótipo silenciosamente |
| CAI/Eletroeletrônica em Cursos; técnico médio em Formação | Integrado e testado com PDF fornecido | `RESUME_IMPORT.md`, testes de classificação; ajuda do formulário já explicita distinção |
| Flag SENAI automática e manual, filtro posterior | Integrado como informação declarada; não substitui comprovação | `web/resume-parser.js`; precisa persistência e filtros no banco |
| Salvar e voltar nos formulários | Parcial | Salvamento real existe, mas navegação uniforme de retorno ainda requer integração por formulário |
| Minha Carreira: vínculos, admissões/saídas, promoções, salários e gráficos | Histórico privado integrado; plano de desenvolvimento ainda pendente | `CAREER_PLAN.md`, `UPDATE_V8.md`; salários e histórico privados |
| Meta: cargo, empresa, salário, prazo, competências, horas, orçamento | Integrado parcialmente | Meta salva no banco; plano por ações, custos, horas e gráficos ainda no protótipo |
| Assistente de currículo, vagas e carreira | Parcial: Redator de vagas e Revisor de currículo em PR, não publicados | `api/agents.mjs`, `src/job-writer-agent.mjs`, `src/resume-reviewer-agent.mjs`; assistente de carreira e consumo dos créditos de IA pendentes |
| Publicar vagas, cursos com certificado e treinamentos sem certificado | Integrado | Empresa e instituição nas respectivas permissões; CEP obrigatório |
| 11 vínculos de vaga | Integrado | CLT, PJ, MEI, Autônomo/Freelancer, Estágio, Jovem Aprendiz, Temporário, Intermitente, Doméstico, Voluntário, PCD |
| Compartilhar anúncios | Integrado | Página inicial e detalhes; compartilhamento/cópia do link |
| Busca de vagas/cursos e currículos públicos | Integrado parcialmente | Texto/tipo nos anúncios e nome/profissão/competência/cidade nos currículos; demais filtros pendentes |
| Favoritar por estrela, sem reconstruir vitrine | Integrado para vagas/cursos/treinamentos; currículo favorito pendente | Modelo do protótipo existe; exige favoritos privados por usuário e persistência no banco |
| Impulsionar, campanhas, rodízio global e métricas de exposição | Pendente | Flags de destaque da demonstração não constituem campanha paga |
| Ordem: relevância/filtros, impulsionamento, plano, pontos, distância, desempate | Pendente de integração completa | Produção usa destaque/data. Não simular distância desconhecida nem pontuação comprovada |
| Nome oculto da empresa | Pendente de integração real | Há regra histórica de plano superior e revisão V8 conflitante. Confirmar regra comercial antes de expor identidade; nunca esconder apenas no CSS |
| Subusuários e permissões; compras autorizadas pelo principal | Convite, aceite, revogação e quatro permissões operacionais integrados; cobrança/reauth financeira futura | `ORGANIZATION_TEAMS.md`; precisa transações, convites reais e permissão no servidor |
| Departamentos, convite/aceite, substituição e médias por setor/organização | Departamentos e convite/aceite integrados; substituição e médias pendentes | Modelo documentado no protótipo; convite não cria vínculo automaticamente |
| Pontuação por aprendizado concluído e comprovado | Integrado com comprovante privado e validação exclusiva do proprietário | `LEARNING_SCORE_PLAN.md`; validação não pode ser uma marca enviada pelo navegador |
| Desenvolvimento pessoal/intelectual/espiritual | Registros e pontos privados integrados; recomendação assistida pendente | Espiritual opcional e privado, fora da classificação de emprego; regras profissionais precisam relevância |
| Processos seletivos por etapa, cronograma, concluir/reverter e ranking | Etapas por candidatura, cronograma e concluir/reverter integrados; avaliação/ranking pendentes | `RECRUITMENT_PLAN.md`; candidaturas reais já integradas, etapas/avaliações ainda não |
| Entrevista: propor, aceitar, recusar, reagendar, cancelar | Integrado parcialmente | Banco, revisão contra conflitos de edição, avisos. Contraproposta do candidato e conflitos de agenda ainda pendentes |
| Google Agenda para entrevista confirmada | Integrado | Evento preenchido, usuário salva. Atualizações/cancelamentos externos manuais |
| Vídeo, pré-entrada, avaliação e ranking | Avaliação/ranking por vaga integrados; vídeo e pré-entrada pendentes | Sala do protótipo é simulada; link HTTPS externo funciona no agendamento real |
| Dashboard do dono com períodos/gráficos e avisos segmentados | Integrado | Dia, semana, mês, trimestre, semestre, ano; perfis/região/UF/cidade; sino e leitura |
| Planos e descontos | Catálogo e seleção integrados; cobrança real pendente | Candidato 0/19,90/49,90/99,90; empresa/escola 0/99/599/2.990. Trimestre 10%, semestre 20%, ano 30%. Créditos e benefícios não estão ativos |
| Asaas: cartão/Pix/boleto/Pix automático | Sandbox integrado | Não representa recebimento real ou assinatura paga ativa |
| Blog e lista de desejos de cursos | Integrado | Rascunhos privados/editor autorizado, desejo privado por usuário |
| 5% do faturamento após 5.000 assinantes e cursos mensais | Planejamento | Não há sorteio ativo, autorização/regras finais ou resultado real |
| Agente editorial de notícias, legislação e dicas | Manual integrado; agenda pausada | Pesquisa e rascunho com revisão humana; não inventar entrevistas nem publicar automaticamente |
| App instalável, botão na inicial, celular/tablet | Integrado | PWA, Android e instruções iPhone/iPad, mesma conta; sem dados privados offline |
| Dupla verificação por celular/biometria | Pendente | Confirmação de e-mail já integrada; não prometer SMS ou passkey ativos |
| Piloto SENAI Sumaré, 05–06/11, cerca de 300 alunos 16+ | Preparado, não liberado institucionalmente | Não confundir cadastro público de testes com autorização da escola |

## Próxima integração real, preservando a ordem de dependências

1. Currículo: upload/parser revisável, flag SENAI, navegação Salvar e voltar e favoritos privados.
2. Histórico de carreira e plano de desenvolvimento persistidos por usuário.
3. Organizações, subusuários/permissões, departamentos/convites e índices confiáveis.
4. Processo seletivo completo, contraproposta/conflitos, avaliação e provedor de vídeo.
5. Pontuação validada, busca ordenada, campanhas e créditos; cobrança real após testes próprios.

Cada etapa só muda de estado após persistência real, autorização, testes e publicação. Não transportar armazenamento local de demonstração para produção como se fosse banco multiusuário.

## Fontes a preservar

Histórico da conversa; `PRIVATE_PROTOTYPE_REVIEW.md`, `UPDATE_V8.md`, `RESUME_IMPORT.md`, `CAREER_PLAN.md`, `LEARNING_SCORE_PLAN.md`, `PROMOTION_PLAN.md`, `NAME_VISIBILITY_PLAN.md`, `ORGANIZATION_TEAMS.md`, `ORGANIZATION_QUALITY_PLAN.md`, `RECRUITMENT_PLAN.md`, `ADMIN_AND_NOTIFICATIONS_PLAN.md`, `JOB_TYPES_PLAN.md`, `PWA_NOTES.md`; implementação/testes de produção em `pilot-sumare/`.

Documentos antigos de ativação são retratos datados, não prova do estado atual. Em conflito de requisito comercial, recuperar a instrução do usuário antes de aplicar versão incompatível. Nunca inventar que foi possível revisar conversas indisponíveis: este inventário usa o histórico acessível e recuperado.

## Integração e ensaio — 17/10/2026, 21h (Brasília)

Implementados no banco real: favoritos de anúncios por usuário; vínculos privados de carreira com promoções e séries financeiras/responsabilidade; departamentos de empresa/escola; convite a candidato de cartão público, aceite/recusa, cancelamento/encerramento sem privilégio administrativo; etapas por candidatura, cronograma e concluir/reabrir; avisos aos participantes. Interface em `pilot-sumare/app/extended.mjs`.

Ensaio `pilot-sumare/tests/demo-communication-seed.sql`: 50 candidatos, 50 empresas e 50 instituições, com contas fictícias sem senha/login. Exercita a role `authenticated` e as políticas por identidade no banco, não sessões reais do Auth nem logins no navegador. Cria registros persistentes de demonstração e verifica isolamento de carreira/favoritos, respostas da instituição, etapas e vínculos. Não envia e-mails, contrata pessoas ou efetiva matrículas. Painel do proprietário passa a consultar as contagens reais desse ensaio.

O restante do inventário continua pendente onde indicado. A migração não transforma sala de vídeo simulada, pontuação simulada, permissões de subusuários ou cobrança em recursos operacionais.

## Upload, SENAI, formação, acessos delegados e ranking — 17/10/2026, 22h (Brasília)

- Leitores do protótipo copiados com versões/licenças preservadas para `pilot-sumare/app/import/`. PDF, DOCX, organização de colunas e OCR local português. Arquivos limitados a 5 MB, PDF até 20 páginas/OCR até 5 páginas. Revisão por campo evita substituir informação existente sem seleção. CPF/e-mail/contatos extraídos não são publicados automaticamente.
- Anexos de currículo e comprovantes em bucket privado; currículo original é acessível somente ao candidato, comprovante ao candidato/proprietário avaliador. Links de leitura expiram em 60 segundos. Políticas verificam conta, turma e finalidade. Não há cache offline dos dados pessoais.
- SENAI detectado no parser, editável manualmente e com consentimento separado para o cartão público. Filtro de busca e selo dizem informação declarada, sem confundir com diploma validado.
- Formações concluídas exigem comprovante; apenas proprietário valida/rejeita e autoriza indicação do portal. Edição retira validação; duplicatas normalizadas bloqueadas. Pontos profissionais calculados no servidor; progresso das demais áreas privado e fora da classificação de emprego.
- Subusuários: convite interno para conta cadastrada/confirmada, aceite pelo próprio convidado e revogação imediata. Permissões efetivas: editar perfil, publicar, buscar candidatos e gerenciar avaliação/ranking. Atuação por organização em espaço separado preserva perfil pessoal. Financeiro, gestão de acessos e decisões de concessão continuam exclusivos do principal; IA/créditos e compras com reautenticação não foram ativados.
- Critérios comuns por vaga, congelados após primeira avaliação; avaliação após fim de entrevista confirmada; notas 0–10, média e dense_rank com empates. Notas/evidências internas e acesso negado a candidato participante do próprio processo. Uma entrevista atual por candidatura; múltiplas rodadas de entrevista/rubricas versionadas ainda pendentes.
- O PDF real fornecido foi testado localmente e não foi gravado no bucket, no Git, nos perfis fictícios ou na vitrine. Testes DOCX/PDF com colunas e OCR passaram com fixtures sintéticas. Ensaio hospedado de SENAI, delegação, avaliação e revogação foi revertido.
- QA: 76 testes automatizados aprovados, sem skips na execução com o PDF autorizado; suíte de leitores reais também aprovada. Instalação e upload/recuperação com sessão real em aparelho móvel ainda precisam de validação manual do proprietário.

Relatório e roteiro: `pilot-sumare/docs/TALENT-FEATURES.md`. Preservar também o restante do inventário: plano de carreira completo, vídeo, contraproposta/conflitos, médias de equipe, campanhas, IA pessoal, SMS/biometria e operação comercial continuam pendentes onde indicado.

## Correção de confirmação de cadastro — 18/10/2026

- Investigação do Auth confirmou cadastro não verificado e erro `email_not_confirmed` na entrada. Solicitação de confirmação retornou 200; isso não comprova entrega na caixa postal. Logs consultados não mostraram falha SMTP explícita.
- Login passa a distinguir e-mail pendente; tela dedicada informa uso de link, oferece reenvio pelo Supabase Auth e mantém o endereço informado sem senha. Limite de envio/falha do provedor continuam erros, sem falsa indicação de entrega.
- CPF/CNPJ agora solicitado e validado quanto ao formato no início. Não armazenado no navegador ou metadados. Após confirmação, documento precisa ser informado novamente: unicidade e vínculo definitivo continuam exclusivamente no servidor. Não há reserva antecipada do documento.
- Validação: 79 testes passaram, um teste do PDF privado não executado nesta alteração; build aprovado. Entrega real do e-mail depende de validação na caixa destinatária/provedor.

## Exceção expressa de CPF do proprietário — 17/10/2026, 23h21 (Brasília)

- Usuário autorizou duplicidade exclusivamente para seu CPF já vinculado ao proprietário. Índice único parcial captura exatamente essa chave privada no momento da migração; qualquer outro CPF e todo CNPJ continuam únicos. Abortaria sem exatamente um CPF de proprietário ativo. CPF e chave reais não são incluídos na fonte.
- A exceção não concede papel de proprietário, não compartilha currículo/dados e não altera confirmação de e-mail nem documentos já vinculados. Nova conta permanece candidata, com identidade própria.
- Teste de índice em PostgreSQL local: CPF autorizado repetido aceito, demais CPF/CNPJ repetidos rejeitados. Ensaio hospedado transacional: cadastro documental e ingresso público retornaram learner, proprietário preservado; registros do ensaio revertidos. Usuário pode repetir Concluir cadastro documental na conta confirmada.

## Web Push e indicador do app — 17/10/2026, 23h (Brasília)

- Notificações opcionais por aparelho, até cinco inscrições por conta. Botão Notificações no aparelho na área autenticada, permissão do navegador e desativação local/remota. Primeiro registro cria aviso de teste; contas fictícias excluídas.
- Novos avisos alimentam fila privada transacional e despacho automático pelo Supabase Cron/pg_net para Vercel, somente quando há pendências; até cinco tentativas, leases, limpeza de endpoints expirados. Chaves VAPID e credencial de disparo protegidas, sem fornecedor adicional contratado.
- Push mostra texto genérico e quantidade de não lidos, sem detalhes pessoais; clique abre a central após login. Contador via Badging API nos sistemas compatíveis; outros podem mostrar bolinha/nenhum badge. Não prometer número em todo Android/iOS. Leitura atualiza o navegador atual; outro aparelho atualiza ao abrir/receber novo push.
- Segurança: endpoints restritos aos serviços de navegador conhecidos, gravação autenticada e mesma origem, fila/inscrições sem acesso do cliente, papel ativo no servidor, nenhuma permissão nova por inscrever aparelho. Saída remove inscrição e limpa indicador.
- Testes: suíte geral 85 aprovados e um PDF privado não executado nesta alteração, mais teste de banco de push aprovado; ensaio hospedado da fila com role service_role revertido. Recebimento real e indicador dependem de usuário ativar no dispositivo. Roteiro: pilot-sumare/docs/PUSH.md.

## Separação de perfis e restauração visual de carreira — 18/10/2026

- Instrução expressa: candidatos não acessam busca/currículos de terceiros e não veem controles de recrutamento/administração. Menu pessoal mostra currículo próprio, carreira, meta, formação, participações, favoritos, avisos e próprios convites. Empresa/instituição têm menus pertinentes; convites delegados mantêm atuação separada por organização e permissões previamente autorizadas.
- Busca de currículos protegida na interface, repositório e RPC; RLS de cartões autenticados permite candidato consultar apenas o próprio. Pontos de outras pessoas também vedados a candidato. Organizações/proprietário preservam busca autorizada. Página inicial reconhece sessão de candidato e remove vitrine/botão de candidatos. Cartões-resumo públicos com consentimento continuam na homepage anônima conforme combinado; isso não publica o currículo completo real.
- Painel restaurado a partir de web/career.js: menu lateral no computador, navegação adaptada a celular, destaque da seção, panorama, indicadores financeiros/vínculos, dois gráficos por data (financeiro e responsabilidade), tabela acessível e linha do tempo de admissões/promoções/saídas. Formulário de vínculo separado com Voltar, atalhos de meta. Mantidos histórico e dados reais por usuário; nenhum exemplo local transportado para banco. Plano completo de desenvolvimento continua pendente onde indicado.
- Validação: 89 testes aprovados e um PDF privado não executado; build aprovado. Após ajuste final do menu lateral, testes DOM afetados repetidos e aprovados. Ensaio no banco hospedado bloqueou busca de candidato, retornou zero cartões de terceiros e preservou busca de recrutador; ensaios revertidos. Sem revisão visual em aparelho nesta sessão.
- Proprietário reiterou autorização para consultas, correções, implementação e publicação necessárias ao lançamento real. Preservar decisões e funções existentes; decisões comerciais e contratação de serviços continuam sendo apresentadas ao proprietário quando necessárias.

## Convite de equipe por CPF e revisão LGPD — 18/10/2026

- Correção expressa de Sylvio: empresa/instituição informa CPF exato para convidar; jamais carregar lista de candidatos nessa etapa. Campo CPF e declaração de finalidade substituem o select. Consulta exclusivamente no servidor por HMAC privado; nenhuma chave ou documento gravado no convite, URL, navegador persistente ou logs da aplicação.
- Endpoint POST de mesma origem verifica bearer e e-mail. RPC exclusiva de serviço verifica organização ativa, titularidade do departamento, turma e candidato ativo. Limite transacional de 10 tentativas/hora e 40/dia por organização, inclusive sem correspondência. Nenhum nome/currículo é retornado pela consulta; resposta neutra, sem escolher conta arbitrária em CPF excepcional ambíguo. Existência de convite pendente na equipe ainda permite inferir que houve correspondência, portanto não alegar anonimato absoluto.
- Novo convite fica Pendente de aceite, com nome oculto. Aceite exclusivo do candidato altera para Conectado e compartilha apenas nome e vínculo. Recusa/cancelamento e encerramento preservados; candidato também pode encerrar. Não concede administração, acesso ao currículo, contato ou salários. Notificações na central; push segue as inscrições existentes, sem envio externo de e-mail.
- Caminho antigo por ID de cartão bloqueado no banco, inclusive chamadas diretas. Nomes de convites pendentes anteriores substituídos por rótulo; vínculos aceitos e dados dos perfis preservados. Busca de talentos opt-in tem finalidade separada e não alimenta equipe.
- Regra permanente incorporada a AGENTS.md: toda alteração/implantação consulta histórico disponível, LGPD e orientação oficial pertinente; registrar finalidade, hipótese legal, minimização, transparência, acesso e direitos. CPF não prova identidade e não é autorização de acesso a currículo. Aceite do vínculo não regulariza automaticamente tratamento anterior.
- Referência oficial consultada: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm — arts. 6, 7, 8, 9, 18 e 46. Ver análise específica em pilot-sumare/docs/TEAM-PRIVACY.md. Não representa certificação de conformidade integral.
- Validação: 91 testes aprovados, 1 teste de PDF privado não executado; build aprovado. Ensaio transacional no banco hospedado com empresa, escola e candidato sintéticos: convite, pendência, isolamento, bloqueio de aceite pela organização, aceite/recusa e avisos; tudo revertido. Não houve envio para usuários reais. Navegador/aparelho não disponível para revisão visual.

## Correção de Meus vínculos e menu lateral — 18/10/2026, 10h49

- Causa reproduzida: loadAccess zerava papel/estado durante cada revalidação, inclusive atualização assíncrona do badge. A leitura intermediária montava menu incompleto e a abertura de equipe avaliava candidato após iniciar repo.team(), entrando indevidamente em departments() e falhando por permissão.
- Revalidação preserva o último estado ativo confirmado enquanto consulta; operações continuam aguardando validação atual do servidor. Falha, suspensão e identidade inválida removem acesso. A tela de equipe captura o contexto pessoal antes das consultas paralelas. Mesma navegação para cada papel em equipe, oportunidades e conta, com indicação da seção de vínculos ativa.
- Teste de regressão reproduziu falha antes da correção; teste com consulta pendente e suspensão confirma remoção posterior de acesso. Navegação DOM cobre candidato, empresa, escola e proprietário e a tela vazia de vínculos. Não altera regras CPF/aceite, políticas do banco, permissões ou dados.
- Revisão LGPD: consultado texto oficial compilado do Planalto em 18/10/2026, arts. 6 e 46. Finalidade restrita à correção da navegação, sem coleta, compartilhamento ou retenção adicional; controles existentes e validação por operação preservados. https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
- Validação final: 96 testes aprovados, um teste de PDF privado não executado; build aprovado. Revisão visual em navegador/aparelho não disponível nesta sessão.

## Currículo guiado, foto e logos — 18/10/2026

- Pedido de Sylvio implementado a partir dos quatro prints: sete etapas, campos de contato, múltiplas experiências/formações/cursos, competências, objetivo, revisão e prévia de currículo em duas colunas. Mantidos roxo/turquesa, menu por perfil, ajudas, impressão/Voltar, SENAI e upload/parser/OCR revisável.
- Conteúdo anterior preservado como texto revisável por seção; dados novos estruturados combinados sem duplicação ao recarregar. Importação mapeia nome, contato/local/CEP e textos; não inventa estruturas quando o arquivo não as fornece. Salvar grava no banco; navegação entre etapas preserva edição em memória, saída sem salvar não grava automaticamente.
- Foto opcional com ajuste local; logo opcional de empresa/instituição com exibição e sincronização nos anúncios. Sem importar rostos/dados dos prints para contas. Imagens raster compactas sob políticas de linha; anexos originais continuam privados. Foto, contato e dados adicionais não públicos, seleção separada para novas candidaturas e impressão. Não alteram ranking/permissões.
- Migração 20261018141505_guided_resume_profiles_and_optional_images. Testes e revisão de privacidade detalhados em pilot-sumare/docs/RESUME-WIZARD.md; consulta LGPD oficial feita. Não declarar conformidade integral nem verificação visual em dispositivo sem teste real.
- Validação final desta entrega: 102 testes aprovados, sem falhas ou skips; inclui leitura local do PDF privado previamente autorizado, sem persistência externa. Build aprovado; ensaio hospedado com registros sintéticos revertido. Revisão visual no aparelho permanece pendente.

## Imagem opcional nos cards — 18/10/2026

- Foto do candidato e logo de empresa/instituição no canto superior direito, somente após seleção explícita. Upload não concede autorização de exibição. Controles separados da autorização de foto em currículo/candidatura.
- Desmarcar e salvar retira a imagem; foto substituída/removida sincroniza. Banco controla cópia e mantém isolamento por usuário. Sem alteração de pontuação, currículos privados, convites ou permissões.
- 25 de cada 50 contas fictícias com imagem e 25 sem imagem, usando imagens sintéticas reutilizadas. Fictício abaixo da imagem quando presente; posição anterior sem imagem. Carrosséis de 5 segundos e pausa preservados.
- Migração 20261018144012_optional_featured_card_images; consulta LGPD e detalhes em pilot-sumare/docs/CARD-IMAGES.md. Sem afirmação de conformidade integral ou revisão visual em aparelho.

## Cards sem rolagem e alternância visual — 18/10/2026

- Corrigida a altura fixa de 440/460 px com overflow:auto que provocava rolagem interna. Todos os cards de cada carrossel ocupam a mesma linha de grade, com altura natural definida pelo maior conteúdo (mínimo 500 px). Cards fora da página ficam invisíveis e sem interação, mas conservam sua contribuição à medida; altura não muda na troca. Mesma dimensão com/sem imagem; adaptação automática à largura e às fontes sem cortar conteúdo.
- Demonstrações alternam com imagem/sem imagem dentro do mesmo nível de destaque. Mantidos registros reais nas posições recebidas e todas as 50 demonstrações; sem alteração de ranking real, permissões ou banco. Pausa/avançar/voltar e 5 segundos preservados.
- Revisão LGPD: consultado texto oficial compilado do Planalto em 18/10/2026, art. 6. Mudança visual, sem nova coleta, finalidade, compartilhamento ou retenção; autorização de imagem e isolamento existentes preservados. https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm

## Vantagens de assinantes — 19/10/2026
Catálogo atualizado: níveis 1/2/3, prioridade crescente, treinamentos até o nível e 20/25/30% do pacote em créditos de IA a R$ 1/uso, sem acumular. Preços históricos preservados. Inicial mostra só vantagens; valores na área autenticada. Convenções e revisão LGPD em `pilot-sumare/docs/SUBSCRIBER-BENEFITS.md`. Cobrança real, carteira/consumo de IA e liberação de treinamentos continuam pendentes; esta mudança define e apresenta regras, não concede benefícios com seleção/sandbox.

Autorização explícita de 19/10/2026: usuário pediu preparar cobrança em ambiente real. Funções dos agentes serão definidas em seguida, com capacidades progressivas por nível, além do saldo. A inspeção das variáveis confirmou somente ASAAS_SANDBOX_API_KEY, sem chave de produção. Não confundir implantação Vercel production com ambiente financeiro Asaas produção.

## Chave Asaas de produção — 19/10/2026, 13h
Variável ASAAS_PRODUCTION_API_KEY confirmada como Secret/Sensitive, exclusiva Production, chave Sandbox preservada. Publicação Vercel dpl_Bc91NdjxKm2qFzhgRKdyFAoN6drA terminou READY e aplicou a configuração. Build inclui diagnóstico GET /myAccount/status somente se VERCEL_ENV=production e chave presente, emitindo apenas connected/accountStatus/billingReady, sem documentos/chaves. Consulta aos logs retornou 403 de escopo; CLI não disponível. Portanto aprovação cadastral e execução do diagnóstico não foram observadas diretamente; READY não comprova capacidade de cobrança. Nenhuma transação, webhook real ou assinatura foi criada. Demais integrações financeiras pendentes continuam descritas em docs/SUBSCRIBER-BENEFITS.md.

### Cobrança real — 19/10/2026, etapa financeira

Implementado em `pilot-sumare/api/subscriptions.mjs` e `/assinatura.html`: checkout recorrente em produção, histórico individual, reautenticação, cancelamento, conciliação autenticada e créditos por período sem acúmulo. Banco financeiro aplicado com RLS e acesso exclusivo pelo servidor. Contratação restrita ao proprietário enquanto os benefícios estão em implantação; ainda sem homologação de pagamento real. Cadastro de segredo do webhook bloqueado pela permissão 403 da conexão Vercel; requer ação no painel antes da ativação. Upload da nova versão também bloqueado por 403, portanto esta implementação ainda não foi publicada. Ver `pilot-sumare/docs/BILLING_LIVE.md`. IA por níveis, treinamentos, ranking pago, receita no painel geral e abertura comercial permanecem pendentes; não considerar implementados só porque existe cobrança.

Atualização às 20h23 de 19/10/2026: acesso Vercel restabelecido, segredo exclusivo do webhook criado e versão financeira publicada em produção (`dpl_572q7SRThc3FH9kWyMcHwUkHZRwj`, READY). Conexão, aprovação da conta e configuração do webhook confirmadas no banco. `/assinatura.html` disponível no domínio. Pendentes: pagamento real pelo proprietário, homologação financeira e benefícios antes da abertura aos demais usuários.

## Velocidade e cabeçalhos — 20/10/2026 (juntado ao main; publicação automática pelo GitHub ligada no Vercel em 21/10/2026)

- Logo: páginas usam `logo-web.webp` (85 KB, 1024 px), gerado de `app/logo.png` aprovado com a mesma regra branco→transparente do filtro SVG (`scripts/logo-web.mjs`). `logo-transparent.svg` continua gerado para links antigos. Visual comparado lado a lado.
- Cache: HTML e `/api/*` seguem `private, no-store`; JS/CSS/manifesto revalidam a cada visita (`max-age=0, must-revalidate`, resposta 304 quando não mudou); imagens, fontes e arquivos do OCR ficam 1 dia em cache.
- Segurança: `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy` e CSP aplicada só nas diretivas sem risco (`frame-ancestors`, `base-uri`, `object-src`, `form-action`). CSP completa em modo Report-Only para observar violações antes de aplicar.
- Contraste: cores originais da etiqueta dos planos e do sobretítulo da faixa final restauradas (WCAG AA).
- LGPD: nenhuma mudança de finalidade, dados coletados, retenção ou acesso; páginas com dados pessoais continuam sem cache.
- Medição local (Lighthouse, sem Supabase): desempenho 73→92, LCP 10,1 s→3,0 s, peso 1.828→362 KiB, acessibilidade 96→100.
- Publicação: o projeto Vercel `o-empregador-online-piloto` publica o `main` pelo GitHub, com Root Directory `pilot-sumare`. Na raiz fica o protótipo, que não deve ir ao domínio.


## Tarefas guiadas de IA — 21/10/2026
Painel Meus agentes: seleção de tarefa por perfil, requisitos em texto e custo explícito de R$ 1,00 antes da execução. Níveis progressivos 1/2/3 e autorização no servidor por pagamento verificado/período/perfil; recusa antes do débito para tarefa inválida ou acima do plano. Integrações automáticas do catálogo continuam planejadas. 152 testes passaram, um PDF privado não executado; build aprovado. Publicação somente na prévia; sem nova migração, pagamento externo ou abertura comercial. Privacidade e matriz em pilot-sumare/docs/AI-TASKS.md.

## Redator de vagas com IA — 20/10/2026 (PR em revisão, não publicado)
Autorização do usuário em 20/10/2026 ("segue a ordem... A, depois B, depois C"). Em "Publicar oportunidade", recrutadores e instituições abrem "Escrever com IA", descrevem a oportunidade e recebem título, descrição, modalidade e vínculo preenchidos no formulário, mais alertas de exigências discriminatórias removidas e lista do que falta. Nada é publicado sem o clique do próprio usuário em "Publicar anúncio". Servidor: `pilot-sumare/api/agents.mjs` com Claude (`claude-opus-5-5`, trocável por `AGENT_AI_MODEL`), saída em esquema JSON validada de novo no servidor. Limite de `AGENT_DAILY_LIMIT` usos por pessoa por dia (padrão 10), reservado de forma atômica em `portal_agent_runs`; falhas contam. Ativação exige `ANTHROPIC_API_KEY` no Vercel; sem ela a API responde 503 e não reserva uso. O limite diário não consome os créditos de IA dos planos; essa integração continua pendente.

LGPD: finalidade, redigir anúncio a pedido do anunciante. Dados mínimos: anotações da oportunidade, nome da organização e cidade/UF; a tela orienta não incluir dados de pessoas e o prompt manda ignorá-los e avisar. Base legal: execução do serviço contratado pelo anunciante (art. 7º, V). Transferência internacional: o texto vai à Anthropic (EUA) só para gerar a resposta; informar na política de privacidade e confirmar as cláusulas do contrato com o fornecedor (art. 33). Retenção: o portal não guarda anotações nem rascunho; `portal_agent_runs` guarda apenas contagem de caracteres, modelo, tokens, situação e erro genérico, legível só pelo próprio usuário e pelo proprietário. Riscos: anotações com dados pessoais (mitigado por aviso e instrução), texto inventado (proibido no prompt e revisão obrigatória), custo (limite diário e esforço baixo).

## Revisor de currículo com IA — 21/10/2026 (PR em revisão, não publicado)
Pedido do usuário em 20/10/2026 ("continue", após a proposta de seguir para o agente de currículo). Na última etapa do currículo ("Revise antes de finalizar"), o candidato pede "Revisar meu currículo" e pode informar a vaga ou área buscada. A IA devolve resumo sugerido, competências encontradas no próprio texto, descrições reescritas por experiência, dicas do que acrescentar e alertas. Cada sugestão só entra no formulário quando o candidato clica em "Usar", e só fica gravada quando ele salva. Mesma rota `api/agents.mjs` (agente `resume_reviewer`), mesmo limite diário de `AGENT_DAILY_LIMIT`, contado em separado do Redator de vagas. Migração `20261020200000_portal_agent_resume_reviewer.sql` libera o agente só para candidatos e proprietário, regra conferida também no banco.

LGPD: finalidade, melhorar o currículo a pedido do próprio titular. Dados mínimos: resumo, competências, cargos e descrições, formação, cursos e certificações. Nome, contatos, foto, endereço, nascimento, estado civil, nacionalidade, CNH e empregadores não são enviados; CPF, e-mail e telefone digitados no texto são removidos no servidor antes do envio e o candidato é avisado. Base legal: execução de serviço solicitado pelo titular (art. 7º, V). Transferência internacional para a Anthropic (EUA), informada na tela; incluir na política de privacidade e confirmar cláusulas contratuais (art. 33). Adolescentes de 16 e 17 anos podem usar, observado o melhor interesse (art. 14 e Enunciado CD/ANPD nº 1/2023): só o próprio titular pede, nada é publicado e nada é guardado. Retenção: o portal não guarda texto nem sugestões; `portal_agent_runs` guarda só contagens, modelo, tokens e situação. Riscos: inventar experiência (proibido no prompt, revisão do candidato), dado pessoal dentro do texto (remoção automática e alerta), viés em sugestões (alertas sobre dados discriminatórios).
