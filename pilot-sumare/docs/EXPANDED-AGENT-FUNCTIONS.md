# Ampliação dos agentes — 21/10/2026

Implantação autorizada por Sylvio, incremental sobre a revisão conectada e o menu expansível. São 54 tarefas: 18 por perfil, seis por nível. Níveis cumulativos: 6/12/18 disponíveis para cada perfil nos níveis 1/2/3. Plano gratuito apresenta os recursos bloqueados. IDs originais e seus níveis preservados; catálogo canônico determina assinatura necessária e autoriza execução no servidor. Menu e botão mantêm o padrão visual anterior. Recursos bloqueados continuam abrindo a assinatura pertinente, sem chamada de modelo ou cobrança.

## Funcionamento e limites

Cada tarefa nova tem instrução específica e orientação de entrada. Currículo continua sendo a única tarefa que carrega campos/anexo salvos e permite aceitar melhorias seletivas. As demais usam dados fornecidos expressamente pelo usuário e, opcionalmente, uma orientação salva retomada. Não há leitura automática de currículos para as outras tarefas, vagas, métricas, alunos, trabalhadores, mercado ou sistemas externos. Descrições e instruções deixam explícita essa limitação. Indicadores e análises de demanda dependem de números agregados fornecidos; não representam radar conectado ou análise causal comprovada. Planos e comunicações são rascunhos para revisão humana; nenhum envio, contratação, decisão sobre pessoa, matrícula, publicação ou agendamento é executado.

Execução explícita custa R$ 1,00 em créditos; abertura, consulta, retomada, salvamento e exclusão são gratuitos. Modelo mantém store:false. Limite de saída ampliado para 1.800 tokens. Respostas incompletas por limite são tratadas como falha, com tentativa de estorno pelo mecanismo existente, sem exibir sucesso parcial. Saldo e plano permanecem verificados pelas regras anteriores. Pagamento real continua restrito à validação financeira existente.

## Continuidade privada

Botão Salvar esta orientação no histórico privado aparece após resposta de texto concluída. Armazena exclusivamente a pergunta e orientação escolhidas, tarefa, perfil, conta, turma e data. Não grava automaticamente nem altera currículo/objetivos/cursos. As sugestões de currículo continuam salvas pelo fluxo próprio, com escolha de campos.

Histórico apresenta as 100 orientações mais recentes, permite excluir e retomar. Retomar apenas preenche a tarefa com contexto anterior e espaço para progresso; usuário revisa antes de nova execução. Entradas longas são identificadas como trechos, respeitando o limite de 4.000 caracteres; original completo permanece visível no histórico. Notas são anotações de trabalho sob revisão do usuário, não evidência de origem, pagamento, certificação ou fatos comprovados. Não foram implantados lembretes automáticos ou acompanhamento em segundo plano.

Tabela portal_ai_notes criada exclusivamente na homologação, SQL reproduzível em db/ai-history.sql. RLS habilitada; nenhum grant para PUBLIC/anon/authenticated. Apenas handler de servidor com service_role autentica, verifica conta confirmada/ativa/não fictícia, perfil permitido e restringe cada operação a usuário/turma/perfil. Não concede acesso ao proprietário ou organização. DELETE exige posse, e gravação ignora identificador de usuário do cliente. Sem SECURITY DEFINER. Exclusão da conta remove notas por FK cascade. Sem logs de conteúdo. Nenhuma migração numerada foi inventada; integrar o SQL à sequência formal antes de produção.

## Privacidade e revisão

Finalidades: assistência profissional/educacional solicitada e continuidade privada escolhida pelo titular. Dados mínimos: textos profissionais próprios ou agregados, tarefa e chaves de isolamento. Hipótese aplicável à prestação solicitada: execução contratual (LGPD art. 7º, V), sujeita à avaliação do controlador; salvamento é opcional e destacado. Não usar dados sensíveis, documentos, contatos ou registros identificáveis de terceiros. Texto livre ainda pode conter dados inadequados, risco que a interface orienta revisar; não afirmar anonimização garantida. Retenção das notas até exclusão do registro ou conta; direitos e atendimento seguem os canais existentes do portal. Não enviar histórico inteiro ao modelo: somente trecho retomado e revisado ao executar. Sem decisões automatizadas sobre emprego ou desempenho individual. Isso não constitui certificação jurídica.

Fontes oficiais consultadas nesta alteração:
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
- https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos/sei_anpd-0140555-nota-tecnica.pdf
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/changelog.md (sem alteração relevante para esta tabela; sem uso de realtime ou GraphQL)

Advisors: nova informação RLS Enabled No Policy na tabela service-only é intencional, acompanhada de revogação de grants. Alerta preexistente de proteção contra senhas vazadas desabilitada permanece; não foi introduzido por esta mudança. Referência: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection .

## Validação

Suíte final: 192 testes aprovados, zero falhas e zero ignorados, incluindo PDF autorizado somente local. Build aprovado.

Testes de catálogo cobrem 54 IDs únicos, seis funções por nível/perfil e progressão 0/6/12/18. Matriz de API exercita cada tarefa de texto em todos os níveis, com provedor simulado: autorização antes de débito, instrução específica no servidor, store:false, reserva/estorno e recusa de saída truncada. Revisão conectada continua coberta pela suíte anterior. Testes DOM cobrem menu dos três perfis, upgrade correto, sessão trocada, salvamento explícito, histórico escapado, retomada sem execução, exclusão e resposta tardia descartada. API de histórico testa usuário/perfil divergentes, conta suspensa/fictícia/não confirmada, proprietário, consentimento ausente, origem inválida e falha de armazenamento.

Ensaio hospedado BEGIN/ROLLBACK confirmou RLS/grants sem acesso de cliente e gravação/leitura/exclusão pelo serviço, sem deixar registro sintético (zero probes após rollback). Não alterou saldo ou plano. Testes de modelo nesta etapa usam respostas simuladas e não representam avaliação qualitativa de 54 respostas reais. Navegador autenticado continua indisponível pelo bloqueio de estado de credencial já registrado; não há nova comprovação visual com três logins reais.

## Candidato

| Nível | Função |
|---|---|
| 1 | Revisar meu currículo |
| 1 | Adaptar apresentação para uma vaga |
| 1 | Escrever mensagem de candidatura |
| 1 | Melhorar descrição de experiências |
| 1 | Entender requisitos de uma vaga |
| 1 | Preparar apresentação pessoal |
| 2 | Preparar uma entrevista |
| 2 | Comparar currículo com uma vaga |
| 2 | Montar plano de estudos |
| 2 | Preparar negociação salarial |
| 2 | Revisar apresentação do portfólio |
| 2 | Planejar transição de carreira |
| 3 | Planejar minha carreira |
| 3 | Acompanhar minhas metas |
| 3 | Revisar meu progresso mensal |
| 3 | Comparar oportunidades profissionais |
| 3 | Preparar conversa sobre promoção |
| 3 | Definir próximos passos após aprender |

## Empresa

| Nível | Função |
|---|---|
| 1 | Preparar descrição de vaga |
| 1 | Criar perguntas de entrevista |
| 1 | Preparar mensagens para candidatos |
| 1 | Preparar roteiro de integração |
| 1 | Escrever comunicado interno |
| 1 | Organizar descrição de cargo |
| 2 | Criar teste prático e critérios |
| 2 | Estruturar entrevista por competências |
| 2 | Planejar treinamento da equipe |
| 2 | Preparar conversa de feedback |
| 2 | Revisar exigências de uma vaga |
| 2 | Analisar dificuldades no recrutamento |
| 3 | Analisar competências do setor |
| 3 | Planejar desenvolvimento profissional |
| 3 | Estruturar plano de sucessão |
| 3 | Revisar indicadores de recrutamento |
| 3 | Revisar resultados da integração |
| 3 | Organizar ciclos de capacitação |

## Instituição de Ensino

| Nível | Função |
|---|---|
| 1 | Planejar um curso |
| 1 | Criar plano de aula |
| 1 | Criar exercícios e rubricas |
| 1 | Revisar material didático |
| 1 | Preparar divulgação de curso |
| 1 | Esboçar proposta de parceria |
| 2 | Revisar conteúdo curricular |
| 2 | Adaptar aula ao conhecimento prévio |
| 2 | Criar projetos práticos |
| 2 | Relacionar curso às exigências de vagas |
| 2 | Planejar recuperação de aprendizagem |
| 2 | Organizar trilha de cursos |
| 3 | Planejar parceria com empresas |
| 3 | Analisar demanda agregada de competências |
| 3 | Planejar portfólio e calendário de cursos |
| 3 | Revisar indicadores educacionais |
| 3 | Revisar ementas periodicamente |
| 3 | Analisar resultados de programas formativos |
