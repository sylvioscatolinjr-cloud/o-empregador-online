# Cursos & Treinamentos OEO — 22/10/2026

## Entrega
27 treinamentos originais, nove por público: Candidato, Empresa e Instituição. Cada trilha tem quatro aulas em texto com exemplos e reflexão, atividade e modelo editável local, cinco perguntas comentadas e desafio mensal. São 108 aulas e 135 perguntas. Níveis pagos cumulativos: 3/6/9 treinamentos originais. Não há certificado automático ou pontuação por concluir. Os testes são formativos, com novas tentativas gratuitas; não constituem exame supervisionado.

Menu Cursos & Treinamentos OEO para os três perfis e proprietário, em /treinamentos.html. Cards inteiros clicáveis mostram título, descrição, tipo, módulo e nível. Todos os níveis publicados do próprio público aparecem; bloqueados abrem a assinatura correspondente. Curso customizado é resolvido a partir do catálogo autenticado, sem confiar no nível da URL. Perfil e plano são validados no servidor antes de entregar aulas, link ou arquivo. Plano confirmado com créditos esgotados continua permitindo leitura, porque treinamento não debita IA.

## Gerenciador do proprietário
Botão Gerenciar cursos e treinamentos, validado no servidor pelo papel pilot_owner ativo/confirmado/não fictício. Cadastros adicionais: curso/treinamento, um ou vários públicos, módulo, título, descrição, nível Grátis/1/2/3, formato PDF/PPTX/link HTTPS, rascunho/publicação e senha adicional opcional. Edição de metadados, publicação/despublicação, pré-visualização administrativa e exclusão com confirmação. Autor e turma são determinados no servidor. Os 27 originais ficam versionados na fonte; o gerenciador insere novos materiais sem alteração de código.

PDF/PPTX até 20 MB: upload direto em bucket privado por autorização assinada específica. O cadastro é criado como rascunho; antes de salvar/publicar o servidor baixa e confere tamanho, assinatura de PDF ou estrutura indicativa de PPTX e ausência de vbaProject.bin. Isso é validação de formato, não varredura antivírus ou validação completa do documento. Arquivos são abertos/baixados por links de 60 segundos, nunca por bucket público. Para substituir arquivo/formato, cadastrar novo material e retirar o anterior. Upload abandonado permanece em rascunho e pode ser excluído; falha na limpeza de arquivo é informada e exige ação administrativa. Não há rotina automática de purga de rascunhos.

Links externos somente HTTPS, sem credenciais na URL, abertos após clique em nova aba, com noreferrer/noopener. Não são carregados automaticamente, incorporados ou baixados pelo servidor. YouTube não listado pode ser visto/compartilhado por quem possuir o link. Senha adicional no OEO protege a liberação pelo portal; não adiciona senha ou DRM ao vídeo. Vídeos privados dependem da configuração e das contas autorizadas no provedor. Não foi realizada alteração no canal ou upload ao YouTube.

Senhas adicionais são opcionais, de 6–100 caracteres, armazenadas como hash scrypt com sal aleatório e conferidas em tempo constante. Nunca são entregues em catálogo, listagem do proprietário ou logs. Campo vazio em edição preserva a senha; remoção explícita limpa a exigência. Proprietário pode pré-visualizar inclusive rascunhos e públicos diferentes; essa exceção administrativa não concede plano aos demais usuários.

## Progresso e privacidade
portal_training_progress guarda somente usuário/turma/perfil/treinamento, aulas marcadas, melhor resultado, confirmação de atividade e datas. Nenhuma resposta discursiva ou rascunho da atividade é enviada. O rascunho fica na página, com download explícito em TXT; não persiste após atualização. Conclusão exige quatro aulas marcadas, melhor resultado >=80% e atividade autodeclarada. RPC atômico preserva marcações e melhor resultado. Progresso é privado e apagável pelo titular, inclusive após expiração do plano; exclusão de conta remove registros via FK. Não alimenta rankings, empregadores ou avaliação individual de alunos.

portal_oeo_learning contém os materiais e metadados cadastrados pelo proprietário. Ambas as tabelas têm RLS ativa e nenhum grant para anon/authenticated/PUBLIC. Acesso somente via serviço, com identidade, associação ativa, turma, perfil e pagamento conferidos. Função de progresso SECURITY INVOKER, search_path vazio, EXECUTE somente service_role. Bucket oeo-learning-private sem acesso direto de cliente; assinatura de upload/download conferida no servidor. Chave de serviço, respostas corretas e aulas protegidas não entram nos bundles públicos. A API existente /api/ai recebe ações training-*; não foi criada uma 13ª função de servidor. Estudar não chama OpenAI nem reserva créditos. Agente relacionado é opcional, com execução explicitamente cobrada pelo fluxo existente e autorização de nível própria.

Finalidades: disponibilizar materiais solicitados, executar acesso por assinatura e permitir acompanhamento privado de estudo. Hipótese de trabalho: execução do serviço contratado/solicitado, com transparência antes de registrar progresso; direitos e atendimento existentes preservados. Dados mínimos: identificador e progresso objetivo, sem nomes, notas individuais de alunos ou dados de terceiros nos exercícios. Materiais devem ser próprios/autorizados. Dados e materiais persistem até exclusão pelo titular/proprietário ou conta, observadas rotinas de atendimento e eventuais obrigações aplicáveis; exclusão de metadados por FK não garante remoção automática de objetos órfãos de Storage, que exige operação administrativa. Risco de compartilhamento de material baixado/link externo permanece; sem promessa de proteção absoluta, validade pedagógica certificada ou conformidade jurídica integral.

## Banco, testes e publicação
Migrações formais no projeto de produção:
- 20261022043041_private_training_progress
- 20261022043659_private_oeo_learning_library

CLI Supabase indisponível no ambiente; migrações aplicadas pelo conector oficial e arquivos nomeados com as versões efetivamente geradas pelo servidor. SQL canônico em db/training-progress.sql e db/oeo-learning-library.sql. Sem migração de contas, assinatura, saldo ou documentos pessoais existentes. Homologação não foi alterada: precisa das mesmas migrações antes de usar essa versão em outro projeto.

27 testes focados aprovados; suíte geral 238 aprovados, zero falhas, um PDF privado ausente ignorado. Incluem conteúdos, gradação por perfil, autoria protegida, URL segura, hash de senha, uploads em rascunho, validação de arquivo, bloqueio de plano/perfil, nenhuma cobrança, progresso atômico, ocultação das respostas e aulas no bundle, rascunho não enviado e mudança de sessão. Build aprovado. Ensaio hosted-oeo-training.sql em produção confirmou conclusão, melhor resultado, rascunho e negação ao cliente; ROLLBACK deixou zero identidades e registros sintéticos. Advisors: sem novos WARN/ERROR; INFO de RLS sem política nas tabelas service-only é intencional. WARN preexistente de proteção contra senha vazada desabilitada permanece.

Ainda requer teste do titular no navegador autenticado: estudo real com persistência e envio de um PDF/PPTX/link de sua escolha pelo gerenciador. Não foi usada sessão privada nem criado material público fictício para simular validação. A reprodução efetiva de vídeos depende do provedor. Publicação não abre compras ao público nem ativa prioridade de exibição, ainda em implantação. Reversão: retornar à implantação anterior do portal; tabelas aditivas podem permanecer, sem apagar progresso ou materiais.

Fontes oficiais revistas:
https://supabase.com/changelog.md
https://supabase.com/docs/guides/database/postgres/row-level-security
https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl
https://supabase.com/docs/reference/javascript/storage-from-uploadtosignedurl
https://support.google.com/youtube/answer/157177
https://www.unesco.org/en/articles/ai-competency-framework-teachers
https://sebrae.com.br/sites/PortalSebrae/cursosonline/gestao-de-pessoas%2Ceda0b8a6a28bb610VgnVCM1000004c00210aRCRD
https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-vf.pdf
