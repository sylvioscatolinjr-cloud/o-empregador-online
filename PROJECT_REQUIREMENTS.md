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
| Assistente de currículo, vagas e carreira | Pendente | IA editorial não substitui assistente pessoal; faltam autorização, orçamento e integração |
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


## Revisão conectada do currículo — 21/10/2026 (homologação)

Pedido expresso: agente lê campos/anexo existentes, mostra melhorias e candidato escolhe manter ou salvar. Implementado no fluxo de revisão conectada; sem nova cópia manual. Texto do anexo extraído localmente; análise autorizada, campos próprios lidos no servidor, comparação e aceitação individual, proposta assinada e salvamento atômico protegido contra edição concorrente. Anexo e dados não escolhidos preservados. Menu Meus agentes padronizado com os controles vizinhos; regra visual registrada em AGENTS.md. 171 testes locais e ensaio SQL hospedado aprovados; chamada real/validação visual do novo fluxo pendentes. Detalhes, privacidade, custo e limites em pilot-sumare/docs/CONNECTED-RESUME-REVIEW.md. Somente branch de homologação; não significa abertura comercial.


## Ampliação dos agentes e continuidade privada — 21/10/2026

Autorizada por Sylvio após a proposta de recursos recorrentes. Homologação passa a oferecer 54 tarefas de IA: 18 por perfil (Candidato, Empresa, Instituição de Ensino), seis por nível e acesso cumulativo 6/12/18. Menu expansível, padrão visual dos botões, IDs originais e encaminhamento de função bloqueada para assinatura correta preservados. Autorização por perfil/plano continua no servidor antes da reserva de créditos. Cada execução explícita custa R$ 1,00 em créditos; nenhuma ação automática ou cobrança ao abrir/retomar tarefas.

Histórico privado opcional para orientações de texto, salvamento expresso, retomada com progresso e exclusão, sem custo. Nova tabela portal_ai_notes exclusivamente na homologação, RLS e grants de cliente revogados, operações de servidor limitadas a usuário/turma/perfil. Retenção até exclusão do registro ou da conta. Revisão de currículo continua conectada aos campos/anexo e salva somente melhorias escolhidas pelo fluxo próprio. Outras funções exigem entradas profissionais ou agregadas fornecidas pelo usuário e não consultam automaticamente currículos, vagas, métricas ou mercado. Lembretes automáticos e execução em segundo plano continuam pendentes.

192 testes aprovados, zero falhas/ignorados, build aprovado. Matriz por tarefa/perfil/nível com modelo simulado; histórico com isolamento e teste hospedado transacional sem resíduos, inclusive negação de acesso SQL autenticado. Ainda sem nova validação visual dos três logins pelo bloqueio do navegador e sem avaliação qualitativa de 54 respostas reais. Sem publicação em produção, ativação financeira ou envio de dados privados novos ao modelo. Inventário detalhado, finalidade/minimização/base/transparência/retenção/direitos/riscos e fontes oficiais: pilot-sumare/docs/EXPANDED-AGENT-FUNCTIONS.md. SQL reproduzível: pilot-sumare/db/ai-history.sql; integrar à migração formal antes de produção.


## Correção da escolha de plano ao abrir recurso bloqueado — 21/10/2026

Captura de Sylvio identificou assinatura.html vazia com Cobrança real em configuração. Consulta autenticada estava indevidamente condicionada às credenciais do Asaas. GET agora independe da prontidão financeira, preservando conta confirmada/ativa, perfil autorizado e escopo do próprio usuário. Todas as mutações continuam bloqueadas sem credenciais; contratação permanece restrita à validação do proprietário.

Tela passa a exibir e permitir selecionar os três planos e períodos para cada perfil, usando preços/créditos oficiais, padrão visual existente e nível necessário derivado do catálogo. Seleção não compra nem concede plano. Erro de carregamento apresenta retorno à conta em vez de painel vazio. 200 testes aprovados, zero falhas/ignorados, build aprovado. Sem migração, nova coleta ou cobrança real. Revisão de finalidade/dados mínimos/base/transparência/acesso/retenção/direitos/riscos e fontes oficiais registrada em pilot-sumare/docs/SUBSCRIPTION-PLAN-SELECTION-FIX.md. Somente homologação; conferência visual dos três perfis permanece em andamento.


## Preparação do banco de produção — etapa 2, 21/10/2026

Etapa 1 de conferência visual de menu expansível e encaminhamento dos recursos bloqueados confirmada por capturas enviadas pelo titular para Candidato, Empresa e Instituição. Empresa e Instituição receberam vínculos de homologação nas contas confirmadas criadas pelo usuário; nenhuma senha, documento ou saldo de produção copiado.

Etapa 2 autorizada e concluída: migração 20261021232120_ai_resume_review_and_private_history aplicada no projeto de produção. Adiciona somente RPC de salvamento seletivo de sugestões do currículo e tabela do histórico privado. RLS e grants de cliente revogados, função SECURITY INVOKER executável exclusivamente pelo serviço, snapshot/lock contra sobrescrita. Nenhuma alteração de perfis existentes, carteiras, assinatura, variáveis, autenticação ou domínio. Produção já possuía reserva/estorno de créditos e colunas do currículo.

Ensaio transacional em produção antes e depois da migração validou salvamento, recusa de snapshot antigo/chave indevida, preservação de contato e campos não selecionados, histórico via serviço e negação de privilégios ao cliente; rollback deixou zero registros fictícios. Digest agregado dos 54 perfis idêntico antes/depois; 154 vínculos, zero pedidos/pagamentos e saldos inalterados. 201 testes locais aprovados, zero falhas/ignorados. Advisors sem novos WARN/ERROR; nova INFO de RLS sem política é intencional na tabela service-only; aviso preexistente de senhas vazadas desativado permanece.

Migração e testes versionados, finalidade/dados mínimos/hipótese/transparência/acesso/retenção/direitos/riscos e fontes oficiais em pilot-sumare/docs/PRODUCTION-DATABASE-STAGE2.md. Banco preparado não equivale a configuração de produção conferida (etapa 3), validação financeira/abertura Assinar (etapa 4) ou publicação no domínio (etapa 5), ainda pendentes.


## Configuração de produção — etapa 3 em andamento, 21/10/2026

Conferidos domínio canônico HTTPS com redirecionamento 308 do apex para www, /api/config ready:true e isolamento de projeto/turma entre produção e homologação. Auth público da produção confirma email habilitado e confirmação obrigatória. Secrets de Supabase/OpenAI/Asaas cadastrados em escopo Production; valores privados não lidos nem copiados. Criadas as duas variáveis que faltavam em Production: AI_CHAT_MODEL=gpt-4.1-mini e AI_CHAT_METERING_ENABLED=true. Dependem de próxima implantação; sem redeploy/domínio ou abertura de cobrança agora. Variáveis da branch preservadas.

Etapa 3 ainda não marcada integralmente concluída: falta conferir Site URL e lista de retornos do Auth no painel Supabase de produção, opções não expostas pelo conector disponível. Revisão via captura do titular necessária. Não alterar template de recuperação com fragmento antes da publicação da página compatível. Secrets presentes não comprovam conexão/cota do modelo, e email habilitado não comprova entrega; ensaios reais ficam registrados como pendentes. Diagnóstico, valores esperados, fontes e revisão de privacidade: pilot-sumare/docs/PRODUCTION-CONFIGURATION-STAGE3.md.


## Revisão Auth e validação financeira — etapas 3/4, 21/10/2026

Captura do titular confirmou Site URL www oficial e retornos /conta/confirmar e /conta/recuperar. Revisão dos endereços concluída; /conta.html é compatibilidade opcional, não callback exigido pelos fluxos atuais. Nenhuma alteração de SMTP/template; entrega e runtime continuam a conferir na publicação. Documento de etapa 3 atualizado.

Etapa 4 iniciada: indicadores financeiros persistidos connected/account_approved/webhook_ready=true; zero pedidos/pagamentos/eventos. 36 testes locais selecionados aprovados. Ensaio de carteira no banco de produção com identidade e pagamento fictícios validou débito, duplicidade, devolução idempotente, insuficiência e revogação com recusa de snapshot antigo. Rollback e consulta posterior confirmaram zero resíduos. Não houve chamada externa nem dinheiro movimentado. Consulta ampla rejeitada pela revisão automática; leitura mínima aprovada sem segredos.

Pendentes compra real pelo proprietário, confirmação/conciliação e crédito, cancelamento de recorrência conforme escolha do titular e teste da IA após implantação controlada. Contratação pública continua bloqueada; domínio não foi atualizado. Roteiro, limitações e revisão de privacidade em pilot-sumare/docs/FINANCIAL-VALIDATION-STAGE4.md; ensaio reproduzível tests/hosted-billing-stage4.sql.


## Pagamento real e correção de conciliação — 22/10/2026 UTC
Pagamento real do proprietário confirmado por consulta atual ao Asaas e vinculado por checkoutSession exato do pedido: Nível 1, R$ 19,90, R$ 3,98 em créditos, zero gastos, período 21/10 a 21/11/2026. Filtro por checkout retornava vazio; código anterior marcava eventos processados sem achar pedido por assinatura ainda não vinculada. Correção publicada isoladamente em main, incorporada também à homologação para não regredir: webhook resolve assinatura por checkout comprovado, feedback explícito/visível na conferência, salvaguardas de valor/status/estorno mantidas. Recuperação pontual sem nova cobrança, removida do build ao concluir. 203 testes gerais passaram com um PDF indisponível ignorado; oito testes financeiros finais passaram. Conta de proprietário real sylvio.scatolin.jr@gmail.com; endereço master exibido não é login Auth cadastrado. Contratação pública ainda bloqueada; agentes ainda não publicados no domínio, e cancelamento/estorno real não foram executados. Detalhes e revisão de privacidade: pilot-sumare/docs/BILLING-RECONCILIATION-HOTFIX.md.


## Correção pontual de conciliação real — 22/10/2026 UTC
Pagamento do proprietário recebido por webhook, pedido ainda pending. Correção isolada em main para pagamento fresco vinculado por checkoutSession exato, feedback explícito e visível no botão de conferência; não libera compra ao público nem publica agentes da homologação. Recuperação temporária limitada no build sem criação/cancelamento de cobranças, somente consulta ao Asaas e registro pelo ledger existente com vínculo comprovado. Detalhes, privacidade, fontes e limites em pilot-sumare/docs/BILLING-RECONCILIATION-HOTFIX.md. Resultado financeiro real será conferido após implantação; não considerar crédito liberado por teste local.


## Resultado confirmado

Consulta autenticada ao Asaas durante recuperação confirmou status CONFIRMED, valor 1990 centavos, checkoutSession exatamente correspondente ao pedido e subscription presente. O filtro GET /payments?checkoutSession=... retornou vazio; a consulta direta do identificador vindo do evento autenticado comprovou vínculo. Recuperação registrou pelo RPC existente; consulta ao banco confirmou pedido active, subscription vinculada, eligible=true, crédito 398 centavos, gasto zero, período 21/10/2026 a 21/11/2026. Nenhum crédito manual/sintético, nova cobrança ou cancelamento foi criado. Implantação inicial dpl_F9MaVg6VGnfwriCYSN5yDJU5SPjW READY no domínio oficial.

Correção definitiva: webhook consulta o pagamento fresco e localiza pedido por assinatura ou checkoutSession; pode vincular assinatura antes da primeira conciliação, com leitura posterior para verificar concorrência. Não depende do filtro vazio nem dos dados de pagamento fornecidos pelo navegador. A chamada temporária de recuperação foi removida do build após o resultado; script fica como operação privilegiada manual. 203 testes gerais aprovados, um PDF indisponível ignorado; oito testes financeiros focados finais aprovados. Contratação pública e publicação dos agentes permanecem pendentes. A conta real de proprietário é sylvio.scatolin.jr@gmail.com; master.sylvio@oempregadoronline.com.br é contato exibido, não conta Auth existente.


## Publicação controlada dos agentes — etapa 5, 22/10/2026 UTC

Versão preparada integra as correções de pagamento do main e os 54 recursos da homologação; banco de produção já preparado, sem nova migração. Corrigido escopo pessoal do proprietário para usar agentes de Candidato com seu próprio plano pago, sem novos níveis/permissões administrativas, sem alterar vínculo no banco. Meus agentes mantém expansão/bloqueios; Planos e pacotes abre a assinatura efetiva. 209 testes gerais aprovados, zero falhas, um PDF indisponível ignorado; 20 testes de navegação repetidos após ajuste do link e build local aprovados. Publicação e checagem de rotas previstas nesta etapa; execução real com carteira/modelo de produção precisa ser confirmada pelo titular após entrar no seu navegador. Contratação pública permanece restrita à validação, SMTP/template não alterados, saldo/pagamento preservados. Riscos, privacidade, roteiro e rollback para dpl_HeJRL2G2o7bWjQSFW3jr18zYwjew em pilot-sumare/docs/PRODUCTION-AGENTS-STAGE5.md.


## Seleção visível antes do consumo de IA — 21/10/2026 (Brasília)

Pedido do titular após captura de produção: destacar a tarefa antes de confirmar cobrança. Botão escolhido usa roxo ativo compartilhado, marca ✓ Selecionado, aria-pressed exclusivo e resumo com nome/custo; confirmação passa a Confirmar e executar. Seleção por link tem a mesma indicação. Recursos bloqueados continuam abrindo assinatura, sem seleção/consumo; preço e regras de carteira não alterados. Dezesseis testes de UI (seleção, revisão e histórico) aprovados, zero falhas, build local aprovado. Sem nova coleta/envio/permissão/retenção; finalidade, transparência e fontes em pilot-sumare/docs/AI-SELECTION-FEEDBACK.md.


## Revisão de currículo: falha com devolução — 21/10/2026 (Brasília)
Captura confirma anexo lido, análise falhou; reserva de 100 centavos devolvida e saldo 298 centavos. Currículo/anexo agora salvos. Não atribuir a falha atual a arquivo ausente nem afirmar causa histórica sem diagnóstico: código anterior agrupava fornecedor, truncamento, JSON e validação sem log. Ajuste restringe schema ao target editável existente e até 12 sugestões, reforça identificadores exatos e concisão, mantém validação estrita/consentimento/preço/modelo/devolução. Diagnóstico com UUID/etapa/HTTP/estado/código permitido, sem currículo/prompt/resposta/segredo. 16 testes de revisão aprovados, build aprovado; novo ensaio explícito do titular em produção ainda necessário. Detalhes, limites e revisão de privacidade em pilot-sumare/docs/RESUME-REVIEW-FAILURE-DIAGNOSTICS.md.


## Ajuda expansível em todos os recursos de IA — 21/10/2026 (Brasília)
Pedido do titular implementado nos 54 recursos, tanto no menu Meus agentes quanto na tela de execução: botão ? independente na área visual do recurso, com finalidade e quatro passos específicos; revisão de currículo tem roteiro próprio. Disponível também nos bloqueados, sem selecionar/navegar/cobrar. Padrão visual compartilhado, foco/teclado, alvo 44 px, aria-expanded/controls, sem aninhamento de botões. Textos deixam claros entrada necessária, custo, salvamento e limites das integrações. 19 testes de ajuda/menu/execução aprovados, build aprovado. Sem nova coleta, permissão, retenção ou chamada à IA. Detalhes e privacidade em pilot-sumare/docs/AI-RESOURCE-HELP.md.

Numeração dos agentes: cada perfil exibe recursos 1–18 abaixo da ajuda e quantidade liberada pelo plano sobre total, no menu e execução. Não confundir com saldo de créditos. Ajuda, seleção e bloqueios preservados; 20 testes direcionados e build aprovados. Revisão LGPD/ANPD sem nova coleta, finalidade ou retenção.

Revisão de currículo: log real 23:53 confirmou resposta completa rejeitada em invalid_value antes dos cartões. Schema com limites, omissão de itens vazios/inalterados sem apagar dados, códigos seguros de tipo/tamanho, seleção e estorno preservados. 18 testes e build aprovados; execução autenticada real após correção ainda pendente. Ver docs/RESUME-REVIEW-FAILURE-DIAGNOSTICS.md; sem nova coleta ou retenção, revisão LGPD/ANPD registrada.

22/10/2026: titular confirmou revisão real, escolha, salvamento e persistência. Seleção dos cartões agora usa somente ✓ absoluto à esquerda e cores, sem texto adicional ou alteração de dimensões. Espaço reservado também no estado não selecionado, aria-pressed e resumo preservados. 20 testes de UI/ajuda/menu e build aprovados. Sem nova coleta/retensão/permissão; revisão LGPD/ANPD em docs/AI-SELECTION-FEEDBACK.md.

## Próxima etapa — 22/10/2026
Revisão do aceite: titular confirmou análise de currículo, escolha, salvamento e persistência. Suíte completa atual 219 aprovados, zero falhas, um PDF ausente ignorado. Matriz 0/6/12/18 por perfil e isolamento testados, não significa 54 respostas reais. Roteiros antigos de etapas 4/5 anotados como históricos e login de proprietário corrigido. Checklist atual: pilot-sumare/docs/NEXT-STAGE-CHECKLIST-20261022.md. Próximo ensaio visual: Empresa, depois Instituição, sem gerar compra, dados de terceiros ou créditos artificiais. Benefícios adicionais e abertura comercial ainda pendentes.

Numeração dos recursos movida ao canto inferior direito do cartão nos três perfis, em menu e execução. Ajuda expansível não desloca número; seleção mantém tamanho e contraste. 20 testes e build aprovados. Somente CSS e registro, sem coleta, alteração de acesso ou retenção; LGPD/ANPD revistas.

## Transparência dos benefícios — 22/10/2026
Titular aprovou menus de Empresa e Instituição; isso não valida execução real nesses perfis. Lista de benefícios da página inicial e seleção legada agora destaca IA 6/12/18 e marca treinamentos/prioridade Em implantação. Regras comerciais, preços, percentuais, descontos, permissões e bloqueio da contratação pública preservados. 219 testes aprovados, zero falhas, um PDF ausente ignorado; 11 testes focados repetidos e build aprovados. Privacidade e fontes em pilot-sumare/docs/BENEFITS-DELIVERY-STATUS.md.

## Cursos & Treinamentos OEO — 22/10/2026
Criados 27 treinamentos originais (9 por público), 108 aulas, 135 perguntas comentadas, atividades e progresso privado; níveis cumulativos 3/6/9, sem certificado/pontos automáticos. Menu Cursos & Treinamentos OEO; cards de todos os níveis do próprio público, bloqueados direcionados ao plano correto com validação no servidor. Gerenciador exclusivo do proprietário cadastra cursos/treinamentos para um ou vários públicos, módulo, descrição, nível Grátis/1/2/3, PDF/PPTX privado até 20 MB ou link HTTPS, senha adicional opcional em hash, rascunho/publicação, edição e exclusão. YouTube não listado não ganha senha nativa/DRM; portal protege apenas liberação do link. Progresso sem coleta de texto de atividades, excluível e sem cobrança. Migrações de produção 20261022043041/20261022043659, RLS e grants de serviço, bucket privado; ensaio transacional passou e não deixou resíduos. 238 testes gerais aprovados, zero falhas e um PDF ausente ignorado; 27 focados e build aprovados. Pendente teste visual/autenticado do titular com estudo e upload próprios após publicação. Contratação pública e prioridade de exibição não foram ativadas. Detalhes, limites, fontes e LGPD/ANPD em pilot-sumare/docs/OEO-TRAININGS-AND-OWNER-LIBRARY.md.

## Prioridade na busca de currículos — 22/10/2026
Checklist consolidado por aceite real versus técnico e pendências. Busca autenticada agora ordena destaque, nível Candidato pago vigente, pontos validados, nome e ID; helper privado invoker com acesso de cliente revogado confere ledger exato por usuário/turma/perfil, período, valores e créditos. Preservados guards existentes, projeção sem dados financeiros, filtros/fotos autorizadas/paginação. Não usa escolha visual de plano. Migração 20261022050010 aplicada; consulta mínima confirmou nível 1 do proprietário sem alteração. 239 testes passaram, zero falhas, um PDF ausente ignorado; ensaio fictício de produção com rollback passou e deixou zero resíduos. Prioridade em página inicial, anúncios, área delegada e distância continuam pendentes; rótulo comercial Em implantação e bloqueio de compra pública preservados. Finalidade/base/minimização/transparência/retencão e LGPD/ANPD em pilot-sumare/docs/PAID-CANDIDATE-PRIORITY.md.

## Médias e desempate por distância — 22/10/2026 (Brasília)
Implementadas médias de pontos profissionais públicos por organização e setor, com deduplicação de vínculos aceitos, contas/cartões ativos e distinção de média zero versus indisponível. Anúncios ordenam destaque, plano pago vigente, média, distância quando solicitada e alfabética, antes da paginação. Busca autenticada oferece CEP de referência opcional; candidato autoriza separadamente região aproximada (cerca de 10 km), com remoção e sem persistir CEP/endereço ou devolver coordenadas. Geocodificação AwesomeAPI verificada, Haversine, cache público de 30 dias, 30 consultas por usuário/hora e ausência explicitada. Migrações 20261022113328 e 20261022113333 em produção; 254 testes aprovados, zero falhas, um PDF ausente ignorado e ensaio hospedado com rollback aprovado. Preservados login bloqueado das demonstrações, preços, carteira, compra pública restrita e perfis. Aceite visual autenticado, prioridade na área delegada e histórico de variação das médias permanecem pendentes. Método, limites, retenção, hipótese legal e fontes oficiais em pilot-sumare/docs/ORGANIZATION-POINTS-AND-DISTANCE.md.

## Acesso do proprietário e avisos por grupo — 22/10/2026 (Brasília)
Conferência de produção: sylvio.scatolin.jr@gmail.com é pilot_owner ativo, confirmado, sem bloqueio. master.sylvio@oempregadoronline.com.br é contato de atendimento, sem conta Auth; a grafia sylvio.cscatolin também não foi encontrada. Homologação não contém essas grafias. Permissão administrativa permanece pelo ID autenticado e vínculo no banco; sem mudança de conta/senha/plano/carteira. Enviar avisos ganhou atalho no menu, início do painel e tela própria /conta.html?gerenciar-avisos=1, com e-mail autenticado visível, filtros por público/região/UF/cidade e prévia antes de confirmar. Editar campos, falhar a consulta ou reabrir a tela invalida a confirmação anterior. Suíte geral 259 aprovados, zero falhas, um PDF ausente ignorado; 30 focados finais e build aprovados. Nenhum aviso real enviado nesta validação. Privacidade e detalhes em pilot-sumare/docs/OWNER-NOTICES-NAVIGATION.md.

## Links e arquivos nos avisos — 22/10/2026
Enviar avisos agora permite link HTTPS opcional e anexo único PDF/PPTX/JPG/PNG até 20 MB, com prévia antes do envio. Bucket privado, upload por token escopado, verificação de bytes no servidor, envio atômico ao grupo e download de 60 segundos autorizado pela notificação do próprio destinatário. Migração 20261022151547 aplicada. Sem mudança de conta, plano, carteira ou envio de IA. Suíte geral 269 aprovados, zero falhas, um PDF ausente ignorado; 13 focados, endpoint final, build e ensaio hospedado com rollback aprovados. Primeiro arquivo real no navegador ainda depende do aceite do titular. Retenção, acesso, limites e LGPD/ANPD em pilot-sumare/docs/NOTICE-LINKS-AND-FILES.md.

## Separação visual dos cards de treinamento — 22/10/2026
Captura do titular mostrou status Concluído e ação Continuar treinamento unidos nos cards liberados. A regra genérica .training-card button tinha prioridade sobre .training-card-action e anulava display:flex. Ajustado somente o seletor para .training-card .training-card-action, preservando coluna, espaço de 10 px, bordas, foco, área clicável e padrão existente. Vale para liberados e bloqueados, níveis Grátis/1/2/3 e os três públicos. Dez testes existentes de treinamentos/gerenciamento e build aprovados; matriz DOM verificou separação de status/ação em 108 cards (3 perfis × 4 níveis × 9 cursos). Navegador local sem binário de Chromium; não alegar inspeção visual autenticada. Sem coleta, compartilhamento, acesso, retenção, conteúdo, crédito ou lógica de progresso alterados; finalidade é acessibilidade e clareza. LGPD/ANPD revistas, sem nova hipótese de tratamento ou certificação jurídica: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm e https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-vf.pdf .

## Padronização dos atalhos administrativos — 22/10/2026
Captura do titular mostrou Enviar avisos como botão e Gerenciar Cursos & Treinamentos OEO como link simples. Criada classe compartilhada portal-action que participa da regra base dos botões (tipografia, padding, borda, raio, cores e altura mínima), alinhamento central, foco existente, hover teal e flex móvel. Aplicada aos dois controles e aos atalhos de redação, blog e pagamentos. Sem converter links de navegação em botões semânticos. Regra de reutilização registrada em AGENTS.md. Trinta testes existentes de navegação/avisos/UI passaram, build aprovado; inspeção DOM confirmou os cinco controles com a classe comum. Sem mudança de conteúdo, acesso, coleta, compartilhamento, retenção ou regras financeiras. Finalidade: consistência e acessibilidade, sem nova hipótese legal de tratamento. LGPD/ANPD oficiais revistas: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm e https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-vf.pdf .


## Busca ordenada dos subusuários — 22/10/2026
Área delegada agora usa destaque, plano Candidato pago vigente e pontos profissionais públicos antes de paginar 30 cartões; filtro preservado e marcação Fictício. Mantidos aceite/permissão searchCandidates e responsável principal, com conta e organização confirmadas/ativas/não bloqueadas a cada consulta. Migração 20261022183701 aplicada; 271 testes passaram, zero falhas, um PDF ausente ignorado; quatro focados, build e ensaio hospedado com rollback aprovados, zero resíduos. Sem novo SECURITY DEFINER, grants ampliados, dinheiro ou avisos reais. Aceite visual, distância na área delegada, histórico de variação das médias e demais revisões do piloto permanecem pendentes. Detalhes, minimização e LGPD/ANPD: pilot-sumare/docs/DELEGATED-ORDERED-SEARCH.md.


## Histórico das médias — 22/10/2026 (Brasília)
Histórico privado de medições na área da empresa/instituição e departamentos: referência inicial, médias anterior/atual, subida/queda, contagem e horário de Brasília. Captura somente alterações observadas na consulta, sem retroativo nem causalidade automática de contratação/saída. Até 100 registros por escopo, últimas 20 medições exibidas, cascade ao excluir conta/turma/setor. RPC invoker service-only; principal real e turma configurada conferidos a cada pedido, sem acesso novo de candidato/subusuário. Migração 20261022190540 aplicada; suíte geral 273 aprovados, zero falhas, um PDF ausente ignorado; sete focados finais, build e ensaio hospedado com rollback aprovados, zero resíduos. Aceite visual, log de cada evento e substituição automática continuam pendentes. Sem cobranças ou mensagens reais. Método, retenção, limites e LGPD/ANPD: pilot-sumare/docs/ORGANIZATION-POINTS-HISTORY.md.


## Revisão técnica de celular e acessibilidade — 22/10/2026 (Brasília)
Atalho Pular para o conteúdo nas cinco páginas principais, foco no título ao navegar na conta e feedback com status/alerta. Campos/colunas adaptam textos longos e telas estreitas, labels de seleção com área de 44 px, preferência de movimento reduzido respeitada na rolagem. Corrigido attempt da conta para preservar controles anteriormente desabilitados e estados definidos em telas novas, sem reativar paginação indevidamente. Padrão visual, seleção de IA, interrogação/numeração e separação dos cards de treinamento preservados. 275 testes gerais e 32 focados aprovados, zero falhas; um PDF ausente ignorado na suíte geral; build e inspeção DOM das cinco páginas aprovados. Sem nova coleta, retenção, acesso, backend ou cobrança. Navegador local não instalável nesta sessão: teste visual em aparelho, zoom e leitor de tela real ainda pendentes, sem certificação WCAG integral. Detalhes e fontes oficiais LGPD/ANPD/W3C: pilot-sumare/docs/MOBILE-ACCESSIBILITY-REVIEW.md.


## Verificação de Empresa/Instituição e materiais — 22/10/2026 (Brasília)
Corrigida leitura de nível pago no catálogo/chat/revisão de currículo/treinamentos: exige usuário, perfil e turma configurada, projeta campos mínimos e não usa pagamento de outra turma para liberar recurso. Gerenciamento de treinamento passa a aguardar a rotina assíncrona dentro do try/catch, devolvendo erro JSON controlado após falha. 279 testes gerais e 48 focados finais aprovados, zero falhas; um PDF ausente ignorado na suíte geral e build aprovado. PDF/PPTX testados com Storage simulado e download de 60 segundos, sem envio real ou chamada OpenAI/Asaas. Leitura mínima confirmou Empresa e Instituição ativas/confirmadas e gratuitas; respostas reais pagas continuam pendentes, sem concessão artificial. Zero materiais adicionais cadastrados; primeiro envio/acesso real pode ser validado pelo proprietário com conteúdo Grátis. Titular aprovou conferência visual no celular; leitor de tela real ainda pendente. Sem migração, alteração de plano/carteira ou abertura pública. Detalhes e LGPD/ANPD: pilot-sumare/docs/PROFILE-AND-MATERIAL-VALIDATION.md.


## Correção da instalação no celular — 22/10/2026 (Brasília)
Titular relatou Baixar app rolando para instruções sem instalação. Página agora mostra guia de Android/iPhone imediatamente, inclui Chrome → menu ⋮ → Instalar e criar atalho → Instalar, botão de copiar endereço para navegador externo e instalação direta somente quando o navegador disponibiliza beforeinstallprompt. Cancelamento, concorrência e modo instalado tratados sem declarar sucesso antecipado. Sem APK, nova loja, alteração de identidade do manifesto, service worker, cache ou acesso. 283 testes gerais e seis focados aprovados, zero falhas; um PDF privado ausente ignorado na suíte geral, build aprovado. Manifesto/SW/ícones de produção 200 e MIME correto; instalação efetiva no aparelho ainda pendente de repetição pelo titular. PDF publicado e aberto nos três públicos confirmado nesta conversa; PPTX/link externo/senha adicional continuam pendentes. Finalidade, minimização e LGPD/ANPD: pilot-sumare/docs/PWA-INSTALL-FIX.md.


## Simplificação do fluxo de instalação — 22/10/2026
Nova tentativa do titular mostrou que selecionar Android/iOS criava expectativa incorreta de abrir instalação. Removida a seleção. Botão nativo agora visível com estado explícito de indisponibilidade, só habilitado após o navegador liberar beforeinstallprompt; homepage distingue Como instalar de instalação direta. Instruções do aparelho continuam visíveis. Seis testes focados e build aprovados; instalação real permanece pendente. Nenhuma alteração de manifesto, cache, identidade do app, acesso ou coleta persistente. Mesma revisão LGPD/ANPD e limites em pilot-sumare/docs/PWA-INSTALL-FIX.md.


## Modo de teste exclusivo do proprietário — 23/10/2026 (Brasília)
Pedido expresso do titular autoriza todos os recursos implantados dos planos somente no seu login. Configuração privada Production OEO_OWNER_TEST_USER_ID e papel pilot_owner ativo/confirmado/não fictício/não bloqueado conferidos a cada pedido; ID não gravado em fonte pública. Meus agentes e treinamentos permitem testar Candidato/Empresa/Instituição: 54 tarefas e 27 treinamentos originais, todos os níveis; histórico/progresso próprios por perfil. Sem mudança de cadastro, assinatura, pagamento, prioridade pública ou crédito sintético. Execuções administrativas usam quota própria de 60 tentativas/dia em Brasília, sem débito de carteira, com custo real da API explicitado e confirmação obrigatória. Limite atômico service-only e RLS, migração 20261023102203. 293 testes gerais e 43 focados aprovados, zero falhas; um PDF privado ausente ignorado na suíte geral; build e ensaio hospedado sintético com rollback aprovados, zero resíduos. Nenhuma chamada real de IA, mensagem ou cobrança para validar. Outras contas continuam com bloqueios normais; recursos de roadmap ainda não implantados permanecem pendentes. Método, retenção, reversão e LGPD/ANPD: pilot-sumare/docs/OWNER-ALL-PLAN-TESTING.md.


## Correção móvel dos atalhos do proprietário — 23/10/2026

Captura do titular mostrou os três atalhos espremidos numa única coluna do menu, com quebra letra por letra. Menu Meus agentes expandido agora ocupa todas as colunas da navegação até 950px. Atalhos do proprietário usam grade adaptativa nas telas de IA/treinamentos e uma coluna no submenu, com texto por palavras e aparência portal-action preservada. Ajuda, numeração, seleção e encaminhamento de plano mantidos. 21 testes DOM afetados aprovados e build aprovado; sem validação visual automatizada em navegador nesta sessão. Conferência final no aparelho do titular permanece necessária.

Privacidade: mudança estritamente de apresentação, sem nova coleta, tratamento, compartilhamento, retenção ou hipótese legal. Acesso, transparência, direitos e proteções existentes preservados; principal risco é legibilidade/reflow. Revisados LGPD art.6 (https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) e glossário ANPD/princípios (https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/glossario-anpd/p). Nenhuma captura privada do usuário foi incluída no repositório.


## Novo modelo comercial de IA e recargas — 23/10/2026 (Brasília)

Titular autorizou implementar IA disponível em qualquer plano do próprio perfil, 18 tarefas guiadas + Agente livre por categoria (57 no total), cobrança normal de R$ 1 por execução confirmada e recargas independentes da assinatura. Tela Minha carteira de IA oferece R$ 10/25/50 via checkout avulso Asaas Pix/cartão, sem renovação ou alteração de plano. Créditos do plano preservam percentuais/validade; recargas não expiram; consumo atômico usa primeiro saldo de plano e permite completar centavos com recarga. Reembolsos de falha voltam às mesmas fontes. Webhook fresco, vínculo/valor exatos, idempotência, proteção contra gasto acima do saldo e revogação em estorno/contestação. Nenhum crédito artificial ou compra em nome do titular. Treinamentos, prioridade e exceção de teste do proprietário mantidos; contratação pública de assinaturas permanece em validação anterior, separada da abertura autorizada das recargas.

Migrações 20261023123926 e 20261023124544 aplicadas na produção, com RPCs invoker service-only/RLS. 307 testes gerais aprovados, zero falhas, um PDF privado ausente ignorado; 27 focados finais e build aprovados. Ensaio sintético hospedado com rollback confirmou débito/devolução, isolamento, insuficiência, eventos antigos e revogação mesmo com nova recarga pendente; zero resíduos. Sem chamadas reais de IA/checkout, cobrança, mensagens ou dados financeiros reais alterados na validação. Primeiro pagamento real de recarga e conferência visual autenticada ainda dependem do titular; não declarar concluídos. Avaliação comercial de 60–90 dias e painel novo de rentabilidade não estão automatizados. Modelo, retenção financeira, limites, pausa operacional, fontes LGPD/ANPD e roteiro em pilot-sumare/docs/HYBRID-AI-WALLET.md.


## Correção de checkout e retorno visível na carteira — 23/10/2026

Relato do titular e leitura mínima confirmaram duas recargas failed de R$ 10 sem checkout/pagamento. Recuperação pontual da tentativa já autorizada comprovou HTTP400 invalid_object do Asaas: ausência de chave Pix bloqueava criação com Pix+cartão. Servidor agora consulta somente disponibilidade de chave ACTIVE e oferece cartão quando Pix não estiver disponível, sem expor/gravar valores de chave e sem permissão de criar/remover/consultar chave externa. Mensagens visíveis junto ao botão, alert/rolagem; tentativas sem checkout não mostram Conferir pagamento e API recusa conferência com 409. Checkout pendente aparece como Continuar pagamento no Asaas e esconde nova compra.

Recuperação reutilizou o pedido existente do proprietário, mantendo valor/termos/conta/turma e autorização original. Criação real de checkout no cartão confirmada e salva como pending; zero pagamento associado na conferência, sem dinheiro movimentado, novo pedido, crédito artificial ou alteração de assinatura. Gatilho temporário de recuperação removido do build. Pix aguarda cadastro/ativação de chave pelo titular no Asaas; detecção posterior automática. 313 testes gerais aprovados, zero falhas, um PDF ausente ignorado; 17 focados finais e build aprovados. Pagamento real e validação visual final no celular ainda pendentes. Sem migração ou grants novos. Fontes oficiais, minimização/finalidade/hipótese/retenção/direitos e investigação em pilot-sumare/docs/TOPUP-CHECKOUT-PIX-FIX.md.


## Saldo da carteira em linhas distintas — 23/10/2026

Pedido do titular: Créditos do plano e Recargas avulsas agora ficam em linhas distintas no resumo da carteira, preservando estilo, valores, saldo total e execução. Cinco testes existentes da carteira e build aprovados. Titular confirmou nesta conversa compra real de R$ 10 e crédito recebido; fluxo de pagamento → carteira validado pelo titular, sem nova movimentação para esta correção visual. Finalidade: clareza de apresentação; sem nova coleta, compartilhamento, acesso, retenção ou hipótese legal. Revisão LGPD/ANPD e direitos permanecem conforme pilot-sumare/docs/TOPUP-CHECKOUT-PIX-FIX.md e HYBRID-AI-WALLET.md; fontes oficiais consultadas nesta conversa. Sem alegação de certificação jurídica.


## Contador abaixo do saldo — 23/10/2026

Quantidade de execuções completas em linha própria, imediatamente abaixo do saldo disponível, conforme captura e pedido do titular. Créditos do plano e recargas permanecem em linhas separadas. Cinco testes existentes da carteira e build aprovados. Correção apenas de apresentação, sem mudança de valores, cobrança, acesso, coleta, compartilhamento ou retenção; finalidade de clareza, sem hipótese nova de tratamento. Revisão LGPD/ANPD e fontes oficiais já consultadas nesta conversa, conforme documentação HYBRID-AI-WALLET e TOPUP-CHECKOUT-PIX-FIX; sem certificação jurídica.


## Pesquisa externa Premium e criação de posts — 23/10/2026 (Brasília)

Autorização expressa: pesquisa padrão e ampliada a R$ 2,50 por solicitação, com selo Premium e disponível em qualquer plano do próprio perfil. Candidato pesquisa vagas/cursos; Empresa pesquisa capacitação e canais públicos de recrutamento; Instituição pesquisa captação de alunos/matrículas, canais locais, eventos e possíveis parcerias, sem listas pessoais nem foco em empregos para alunos. Posts de empresa/instituição: legendas, chamadas, carrossel e roteiro, recurso comum de R$ 1; não gera imagens, publica, agenda ou envia mensagens. Catálogo: 20 recursos de candidato e 21 em cada outro perfil, 62 no total, estilo/ajuda/numeração/seleção preservados.

Preço fixado no servidor, aceite específico de250 centavos, modos limitados a3/5 chamadas da ferramenta e até5/10 oportunidades conforme disponibilidade, links inline e horário de Brasília. Carteira mantém plano primeiro, recarga depois e devolução idempotente das mesmas fontes; migração20261023235334 invoker/service-only sem grants ampliados. Proprietário continua60 tentativas/dia sem débito. Recargas/assinaturas/prioridade/treinamentos preservados. 325 testes aprovados, zero falhas, um PDF privado ausente ignorado, build e ensaio hospedado com rollback aprovados. Advisors sem novosWARN/ERROR. Verificação real do provedor durante esta publicação usa apenas critérios genéricos/posts fictícios e não altera carteira; resultado será acrescentado após confirmação. Aceite visual autenticado ainda pendente. Método, limites, tratamento mínimo, retenção, direitos e fontes oficiais LGPD/ANPD em pilot-sumare/docs/PREMIUM-EXTERNAL-RESEARCH.md; sem certificação jurídica integral.


Verificação real concluída nesta publicação: duas consultas genéricas à ferramenta externa retornaram fontes válidas (padrão2, ampliada4) e dois rascunhos fictícios de posts terminaram com2.748/2.809 caracteres. Quatro chamadas reais à API, sem dados pessoais, envio de mensagens, compra ou débito de carteira. Invocação temporária removida do build, sem execução de pesquisa nos builds seguintes; script operacional não é chamado automaticamente. Ajuste final mostra saldo/capacidade Premium por250 centavos na seleção. Trinta testes focados finais e build aprovados. Primeira implantação b3b2de69 ficouREADY no domínio oficial; revisão final remove somente a verificação temporária e registra os resultados. Conferência visual do caso real no aparelho permanece pendente.


## Logo e imagem de referência nos posts — 23/10/2026 (Brasília)

Pedido expresso do titular implementado nos assistentes Empresa/Instituição: dois uploads opcionais (logo e imagem de referência), prévia/remoção independentes e tarefa digitada obrigatória. Referências são efetivamente enviadas como input_image à IA após autorização; não são apenas anexos visuais da tela. Preparo local mantém proporção/transparência e reduz para PNGaté1024px/512KB; servidor valida tamanho/formato/base64/dimensões e rejeita imagens fora das tarefas de posts. Imagens não persistem no banco/histórico e não são carregadas automaticamente do cadastro. Mudança de recurso limpa referências; processamento bloqueia execução e descarta preparo antigo. A resposta continua textual (legendas/roteiro/composição), sem gerar arte final ou publicar. R$1 normal e quota sem débito do proprietário preservados; PremiumR$2,50 inalterado.

332 testes gerais aprovados, zero falhas e um PDF privado ausente ignorado (333 total); 21 focados finais e build aprovados. Validados input multimodal nos dois perfis, consentimento, arquivos inválidos, preço/devolução, prévia/remoção/descarte e regressões da tela/Premium. Sem migração, novos grants, mensagens, compra ou débito real. Testes de provedor simulados; validação visual e primeira referência real pelo titular pendentes. Finalidade, minimização, autorização, retenção/transparência/direitos e fontes oficiais LGPD/ANPD/OpenAI em pilot-sumare/docs/POST-IMAGE-REFERENCES.md, sem certificação jurídica integral.


## Agente de Publicações com geração de imagem — 23/10/2026 (Brasília)

Após prévia e autorização explícita, novo agente nos três perfis abre /publicacoes.html com imagem e texto separados. Criação livre, logo/referência opcionais, quatro proporções exatas1:1/4:5/9:16/16:9 e qualidade mediumR$2,50/highR$5. Texto independenteR$1, sem publicação automática em redes. Catálogo65 recursos:21 candidato,22 empresa,22 instituição. Preservados controles/ajuda/numeração e todos os anteriores; proprietário mantém quota60/dia sem débito na carteira.

Jobs privados com UUID, criação/reserva transacional e idempotente, uma operação processing/review por usuário/turma, custo de250/500 fixado no servidor e validação de aceite/termos/perfil. Geração/edits OpenAI, PNG com dimensões verificadas, upload privado e links60s, reconsulta e exclusão gratuitas. Recusa certa devolve reserva; falha incerta vai a verificação e não repete/estorna API automaticamente. Conciliação de exceções pelo atendimento; não há botão administrativo automático. Originais não persistem, saída fica privada até exclusão. Sem cláusula de isenção total do OEO; direitos legais preservados e aviso de logo/textos alterados.

Migração20261024023538 aplicada em produção: limite das linhas/RPC500 e tabela/bucket privados; invoker/service-only, sem acesso novo do navegador.348 testes gerais aprovados, zero falhas, um PDF privado ausente ignorado;16 focados e build aprovados; ensaio hospedado com rollback aprovado e advisors sem novosWARN/ERROR. Verificação real pontual de geração/entrega privada será registrada após confirmação nesta publicação. Sem débito/compra real de usuário para validar. Aceite visual autenticado no aparelho e conciliação de caso real permanecem pendentes. Custos, limites, reversão, retenção/exclusão de arquivos, dados mínimos, hipótese aplicável e fontes oficiais LGPD/ANPD/CDC em pilot-sumare/docs/PUBLICATION-AGENT.md; sem conformidade jurídica integral declarada.


### Verificação real bloqueada e publicação segura

Duas tentativas reais do teste de imagens recusadas com HTTP401 invalid_request_error e permissão/escopo ausente; diagnóstico não indica chave inválida nem verificação de organização. Não houve geração, arquivo de saída ou job/débito de carteira real. As duas implantações de verificação falharam e mantiveram o site anterior. Liberação do endpoint de geração/edição de imagens na chave/projeto OpenAI é pendente do titular; não substituir chave nem pedir segredo no chat.

Para tornar a entrega revisável sem cobrar por recurso bloqueado, AI_IMAGE_GENERATION_ENABLED=false foi definido explicitamente em Production. API exige true antes de reservar; image-list informa ready=false e UI desativa o botão com indisponibilidade sem cobrança. Texto e demais recursos não dependem dessa ativação. Gatilho temporário de verificação removido do build; script retido para execução explícita após corrigir acesso, seguido de teste real de geração, formatos, armazenamento/download privado e só então ativação/redeploy.350 testes gerais aprovados, zero falhas e um PDF privado ausente ignorado (351 total), build aprovado; testes novos confirmam pausa pré-débito e UI desabilitada. Zero jobs/objetos reais no novo recurso. Não declarar geração de imagem ativa ou validação real concluída enquanto faltar a permissão.


## Revisão de alinhamento — 23/10/2026

Corrigidos Buscar vagas, navegação móvel, grupos de ações, endereços longos e controles com texto ampliado. Build e 66 testes focados aprovados; 175 combinações de largura/página e 16 de texto ampliado no Chromium, sem transbordamento. Ver pilot-sumare/docs/BUTTON-ALIGNMENT-REVIEW.md para escopo e limites. Alterações apenas de apresentação, sem nova coleta/cobrança. A geração de imagens continua pausada por permissão OpenAI pendente; não declarar validação real de imagens concluída.


## Atualização de ativação — 24/10/2026

Substitui o estado anterior de bloqueio por permissão: após o proprietário alterar as permissões da chave, a verificação real no deployment dpl_LUqc3MJirwFE1zi5xtJSggL8GVKy passou em medium 4:5 com referência (1024×1280) e high 16:9 sem referência (1536×864). Em ambos: PNG validado, upload privado, entrega por URL assinada, URL pública negada e remoção dos arquivos de teste. Nenhuma carteira de usuário foi movimentada; chamadas reais tiveram custo do provedor para o portal.

AI_IMAGE_GENERATION_ENABLED foi ativada em produção. Publicação normal usa o código main sem invocação automática de geração no build; o commit de teste é isolado e não integra main. Preços preservados: medium R$ 2,50, high R$ 5,00, texto R$ 1,00. O teste não substitui uma execução autenticada pelo usuário nem avaliação visual humana de todos os formatos. Regras de confirmação, idempotência, revisão de resultado incerto, privacidade e quota do proprietário permanecem.

Revisão LGPD/ANPD: verificação usou somente composição e referência sintéticas, sem dados pessoais; arquivos temporários removidos. Uso real mantém finalidade de criar material solicitado, dados mínimos/consentimento e autorização de imagens na interface, acesso privado e exclusão disponível; retenção e limitações operacionais descritas acima. Fontes oficiais revistas: LGPD (Planalto) e guia de segurança da informação da ANPD. Não constitui certificação jurídica.


## Pix ativo nas recargas — 24/10/2026

Após o titular cadastrar sua chave, consulta real de produção GET /pix/addressKeys?status=ACTIVE&limit=1 confirmou chave ACTIVE; availableTopupMethods retornou [PIX,CREDIT_CARD]. Verificação no deployment dpl_61o6qg46MB6QQvT45NHF3yFJczuq, sem exposição do valor/identificador da chave, sem criação de cobrança, cliente ou checkout, sem pagamento ou alteração de carteira. Não declarar pagamento Pix ponta a ponta concluído.

Não foi necessário alterar a regra de checkout: cada nova recarga já consulta o Asaas, envia billingTypes dinâmico e exibe Pix/cartão na carteira. Checkouts antigos conservam os meios com que foram criados; não recriar uma compra pendente nem pagar novamente se houver dúvida. Recargas continuam creditadas somente após confirmação financeira conferida no servidor e aplicação idempotente. Onze testes focados de meios, recargas e carteira aprovados.

Mantido scripts/verify-pix-availability.mjs como conferência manual somente leitura; não invocar automaticamente em cada build. A configuração normal de build permanece npm run build. Assinaturas recorrentes continuam com cartão no checkout real; Pix comum nas recargas não habilita Pix Automático para planos. Documentação Asaas revista: listar-chaves, checkout-asaas, criar-novo-checkout e checkout-com-assinatura-recorrente.

Privacidade: mesma finalidade contratual de compra de créditos (art.7,V LGPD), sem nova coleta no portal; somente status/métodos resultantes da chave comercial são usados, valores de chaves não retornam ao navegador nem aos logs. Sem nova retenção ou alteração de acesso/direitos; registros financeiros existentes e atendimento preservados. Revisão LGPD/ANPD de continuidade permanece aplicável; não constitui certificação de conformidade.


## Revisão financeira de conclusão — 24/10/2026

Corrigidas consultas de assinatura para restringir histórico/conferência/cancelamento e pré-compra ao usuário e turma configurada. Benefícios vigentes consideram somente o perfil atual; histórico próprio de outro perfil da mesma turma não concede nível. Cinco testes novos de isolamento/cancelamento, 41 focados aprovados; suíte completa 355 aprovados, zero falhas, um PDF privado ausente ignorado (356), build aprovado. Leitura agregada real sem eventos aguardando processamento nem assinaturas/recargas/imagens em revisão no momento da consulta. Sem alteração de dinheiro, planos, carteira, banco ou concessão de acesso público. Renovação/cancelamento/estorno reais e primeiro Pix pago permanecem pendentes; assinaturas públicas mantêm restrição. Checklist atual consolidado em pilot-sumare/docs/NEXT-STAGE-CHECKLIST-20261022.md, relatório em pilot-sumare/docs/FINANCIAL-FINAL-REVIEW.md. Revisados finalidade contratual, minimização, acesso/contexto, retenção e direitos nas fontes oficiais LGPD/ANPD/Supabase; sem certificação jurídica integral.


## Política, Termos, limpeza do protótipo e indicadores — 25/10/2026

Publicadas /privacidade.html e /termos.html como versão preliminar, com campos pendentes destacados, e links no rodapé, login, cadastro, carteira e páginas de conta. Removidos o proxy /laboratorio (site externo do protótipo), a página pública plataforma.html e a frase sobre conta ChatGPT; os endereços antigos redirecionam para a página inicial. Painel do proprietário ganhou a seção Negócio (assinantes, MRR, receita confirmada, recargas, cancelamentos, uso de IA e imagens), só agregada e só para pilot_owner. Assinaturas públicas e indexação continuam fechadas. Detalhes, limites e revisão LGPD em pilot-sumare/docs/LEGAL-PAGES-AND-BUSINESS-METRICS.md. 358 testes aprovados, 0 falhas, 1 ignorado; build aprovado.


## Correção de Ver planos por perfil — 25/10/2026

Links dos agentes e treinamentos preservam perfil e catálogo/preços; proprietário pode consultar os três perfis usando a autorização privada existente, sem mudar identidade ou comprar por outro perfil. Usuário comum mantém catálogo do papel real apesar de parâmetros de URL. Valores mensais conferidos: Candidato19,90/49,90/99,90; Empresa/Instituição99/599/2.990; descontos10/20/30% preservados. 46 focados e suíte365 aprovados, zero falhas, um PDF privado ausente ignorado (366); build aprovado. Sem dinheiro, migração, alteração de coleta/retensão/preços ou abertura de assinaturas públicas. Relatório pilot-sumare/docs/PROFILE-PLAN-NAVIGATION.md. Fluxo branch→PR→prévia→merge conforme AGENTS.md; aceite visual autenticado do titular continua separado.


## Quatro níveis e abertura comercial autorizada — 25/10/2026
Substitui a restrição anterior de novas assinaturas exclusivas do proprietário: titular autorizou venda real nos três perfis. Nova tabela mensal Candidato19,90/39,90/69,90/99,90; Empresa/Instituição99,90/299,90/699,90/999,90. Cashback em créditos de IA20/25/30/30%, validade do ciclo, descontos de pacote preservados e termos2026-10-25-four-tiers-v1. Contratos antigos mantêm preço/crédito/nível originais por tabela versionada. PUBLIC_SUBSCRIPTIONS_ENABLED=true configurado em Production; acesso, senha/consentimento, valor real e pagamento confirmado continuam obrigatórios. Não é aprovação institucional do piloto.
Nove treinamentos4 novos (três por perfil) com36 aulas/45 questões; total36 treinamentos/144 aulas/180 questões,12 por perfil no nível4. Gerenciador, prioridade, seleção, métricas e modo proprietário incluem4; agentes continuam livres por perfil com saldo, sem novos serviços humanos prometidos. Termos e privacidade atualizados. Migração20261025034344 aditiva aplicada, sem mudar dinheiro/contratos/grants públicos. Ensaio hospedado dos três perfis com rollback aprovou30%, idempotência, isolamento e revogação; zero resíduos.30 verificações móveis/desktop em Chromium aprovadas. Detalhes, evidência final, operação e LGPD/ANPD em pilot-sumare/docs/FOUR-PAID-TIERS-LAUNCH.md. Contratação nova real ainda requer acompanhamento; não declarar recebimento por testes simulados.


## Varredura funcional/visual — 25/10/2026
Corrigidas resposta tardia/troca de sessão na assinatura, datas de indicadores financeiros indevidamente baseadas em checked_at, MRR/assinatura sem período pago, contagem de tentativas expiradas como novas vendas, cancelamento apenas solicitado como concluído e exclusão de imagens retirando gerações do total. Dados sem data real do Asaas ficam sinalizados, sem inventar recebimento. Layout adaptado para texto ampliado em cabeçalhos/títulos/valores/mensagens.
387 testes aprovados, zero falhas, um PDF privado ausente ignorado;14 focados finais de sessão/tela, build,111 módulos de sintaxe,122 referências internas e216 verificações Chromium aprovados. Migração20261025041025_stable_payment_dates aditiva aplicada; ensaio service_role com rollback e zero resíduos preservou créditos/consumos/isolamento. Advisors sem novas ocorrências; permanece1 WARN prévio de proteção contra senhas vazadas. Sem dinheiro real, mensagens ou fornecedor pago para validar. Venda real/quatro níveis/cashback/contratos anteriores preservados. Política de Privacidade atualizada; finalidade, minimização, acesso, retenção/direitos e limites em pilot-sumare/docs/PLATFORM-SWEEP-20261025.md. Pendências jurídicas, segurança externa, adolescentes, autorização institucional e aceites reais não foram declarados concluídos.


## Identificação e canais confirmados — 25/10/2026
Titular confirmou razão social conforme comprovante fornecido, CNPJ/endereço, uso de O Empregador Online como nome fantasia no portal, contato@oempregadoronline.com.br para atendimento e exercício de direitos/exclusão e atendimento de segunda a sexta em horário comercial. Termos/Privacidade preenchidos somente nesses campos, sem inventar intervalo de horas, SLA, designação de encarregado ou revisão jurídica concluída. Denúncias, arrependimento e defesa usam o canal de atendimento confirmado; foro empresarial permanece na cidade da sede. Não afirma alteração cadastral na Receita Federal.
Política também documenta o mecanismo de consulta Pwned Passwords já introduzido no PR11: prefixo de5caracteres SHA-1, conexão/IP do navegador, comparação local e continuidade em indisponibilidade. Código de senha e demais fluxos inalterados. Sem nova coleta implementada nesta alteração; transparência da segurança existente e identificação do controlador, LGPD arts.6,9,18,41 e46, legítimo interesse na segurança conforme política existente. Publicação somente dos dados empresariais expressamente fornecidos/confirmados para esta finalidade; PDF, telefone e e-mail pessoal não são adicionados ao repositório. Retenção/direitos/restrições de acesso existentes preservados. Encarregado, prazos destacados, contratos de fornecedores, adolescentes e revisão jurídica continuam pendentes.
Titular confirmou nesta conversa pagamento Pix real de recarga e crédito recebido na carteira; validação funcional ponta a ponta relatada pelo titular, sem nova compra ou consulta individual para registrar a confirmação. Proteção nativa de senhas vazadas Supabase recusada por exigência de plano Pro; não confundir com mecanismo no navegador do PR11.
Fontes oficiais revistas: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm ; https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares . Não constitui certificação jurídica integral.
