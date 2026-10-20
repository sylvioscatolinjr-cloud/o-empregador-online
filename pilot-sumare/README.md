# Piloto Sumaré — contas e ingresso escolar

> Estado atual: o projeto Supabase foi localizado, duas migrações foram aplicadas e o isolamento foi validado no banco hospedado. A aplicação Vercel está implantada; a entrada sem login Vercel foi autorizada e verificada por HTTP 200 anônimo na página inicial e em `/api/config`. SMTP, segredos de servidor e ativação do ingresso seguem pendentes. Consulte `DEPLOYMENT_STATUS.md` e `deployment.json`.

Primeiro módulo preparado em 14/10/2026. Este diretório pertence ao piloto com login independente e **não é carregado pela demonstração do Sites**.

## Decisões do usuário

- Escola na cidade de Sumaré; nome oficial da unidade e aval operacional ainda precisam ser confirmados.
- Aproximadamente 300 alunos, acima de 16 anos, incluindo menores de 18.
- Conta própria por e-mail; conta ChatGPT não pode ser requisito.
- Apresentações em 05 e 06/11/2026.
- Supabase e Vercel instalados e acessíveis nesta sessão.

## Entregue neste módulo

- `src/account-access.mjs`: orquestração por cliente oficial Supabase injetado, sem implementar hashing próprio de senha ou substituir a autenticação da hospedagem atual.
- Cadastro com confirmação de e-mail, entrada, recuperação, atualização da senha e saída.
- Separação entre ter uma conta e ter acesso à turma; perfis do navegador e user_metadata não concedem funções administrativas.
- `supabase/migrations/20261015210327_pilot_accounts_profiles_and_goals.sql`: primeira migração preparada para projeto Supabase dedicado, com turma, vínculos, perfis privados, convites individuais e evento de ingresso.
- Admissão transacional por convite vinculado ao e-mail confirmado, limite de 300 alunos e bloqueio por falta de validações de participação, escola, privacidade e entrega de e-mail.
- Papel inicial sempre `learner`; equipe e proprietário dependem de provisionamento administrativo verificado.
- RLS de leitura/alteração do perfil próprio. Convites, papéis e aprovações não podem ser alterados pelo navegador.
- Contatos privados por padrão; não há catálogo público de estudantes.

## Base executável de contas — 15/10/2026

Há uma aplicação separada em `app/`, com cadastro, entrada, recuperação/alteração de senha, confirmação pelo SDK oficial Supabase, conclusão documental no servidor, convite individual, currículo e meta privados salvos no banco. A primeira implantação está READY na Vercel e já recebeu a referência do projeto Supabase e da turma. **O cadastro permanece desabilitado até a configuração e verificação do envio de e-mail e dos segredos de servidor.** Não substitui o portal demonstrativo publicado e não é uma migração concluída de todos os módulos do portal.

`api/config.mjs` disponibiliza somente URL, chave publicável, origem e turma. Os formulários ficam indisponíveis enquanto infraestrutura e e-mail não estiverem configurados. `api/identity.mjs` valida o usuário no Supabase e confirma o e-mail antes de registrar uma referência HMAC do CPF/CNPJ; não armazena o documento em texto nem concede cargos por autodeclaração. A chave secreta fica apenas no servidor. O CPF/CNPJ é exigido para concluir o ingresso, depois da confirmação do e-mail, e não é gravado nos metadados do Auth.

O SQL inclui os campos de currículo, metas por usuário/turma e referências de identidade privadas. A migração inicial e os índices complementares foram aplicados ao projeto dedicado criado pelo proprietário. As regras de aprovação/admissão continuam fechadas por padrão.

Leia `ACTIVATION.md` para a ativação. A criação inicial do Supabase foi feita pelo proprietário após a indisponibilidade da consulta conectada de custo. O projeto Vercel foi criado e implantado nesta etapa; sua proteção nativa só foi retirada após a autorização explícita do proprietário em 15/10/2026 às 18h32 (Brasília).

## Verificação executada

`node --test pilot-sumare/tests/account-access.test.mjs` — sete testes passaram, com cliente de serviço controlado: metadados, confirmação do e-mail, ingresso independente da conta, papel obtido do banco, restrição de contas suspensas, falha de consulta, recuperação e saída.

**Validação nova:** `npm ci`, `npm test`, `npm run build` nesta pasta. A suíte inclui execução da migração em PostgreSQL local via PGlite, com identidades Auth e papéis de teste, isolamento de perfis/metas, impedimento de escalada de papel, CPF/CNPJ obrigatório para ingresso, estado de aprovação da turma, proteção de menores, reuso de convite e limite de alunos. Não é um teste contra um projeto Supabase remoto nem um ensaio de concorrência/carga para 300 usuários. Há testes de interface DOM para cadastro/recuperação, falhas do provedor, infraestrutura ausente e limpeza de dados ao sair da conta.

**Validação hospedada:** a migração foi aplicada ao Supabase, e `tests/hosted-isolation.sql` passou no PostgreSQL remoto. Todas as linhas de teste foram revertidas. A implantação Vercel retornou READY. Após a autorização para retirar a proteção nativa, a página inicial e `/api/config` responderam HTTP 200 em requisições anônimas; a configuração mantém o cadastro indisponível. Não houve envio de e-mail, teste real de entrega, teste visual em navegador ou ensaio de 300 acessos. Falta ligar esta base aos módulos multiusuário de oportunidades, seleção, entrevistas, avaliação, ranking e equipes do protótipo. Não representa uma plataforma pronta para receber alunos.

## Roteiro inicial (histórico; situação atual em DEPLOYMENT_STATUS.md)

1. Já concluído: projeto Supabase criado pelo proprietário na organização Sylvio Scatolin; estrutura aplicada e isolamento remoto validado. A região escolhida na criação, us-east-2, foi preservada.
2. Consultar o custo e obter a confirmação exigida pelo provedor; criar projeto dedicado em região selecionada, preferindo São Paulo se disponível e adequado à política de dados.
3. Inspecionar a versão/configuração do novo projeto, aplicar migração e executar testes reais de RLS, troca de conta, convite vencido/reutilizado, e-mail divergente, suspensão e concorrência no limite de alunos. Ajustar SQL antes da aprovação de uso real.
4. Configurar confirmação de e-mail e recuperação com SMTP próprio. O envio padrão do Supabase não atende ao ingresso de uma turma externa. Confirmar remetente, domínio, limites, proteção contra abuso e entrega antes do evento.
5. Preparar a aplicação Vercel com SDK oficial, URLs de confirmação/recuperação fixas e configuração pública somente com URL e chave publicável. Nunca enviar service_role ao navegador.
6. Validar proteção do ambiente Vercel antes de qualquer publicação. O piloto restrito usará a autorização do aplicativo e convites individuais; o protótipo atual permanece separado.
7. Confirmar participação e responsável da escola; revisar tratamento dos dados dos adolescentes antes de ativar admissões. Os sinalizadores de aprovação na migração iniciam falsos e não equivalem a uma avaliação jurídica.
8. Completar os módulos de currículo, oportunidades, candidaturas, recrutamento, carreira e administração em dados compartilhados.

## Fontes primárias consultadas

- Supabase, autenticação por senha: https://supabase.com/docs/guides/auth/passwords
- Supabase, SMTP: https://supabase.com/docs/guides/auth/auth-smtp
- Supabase, políticas de acesso: https://supabase.com/docs/guides/database/postgres/row-level-security
- Vercel, proteção de deployments: https://vercel.com/docs/deployment-protection
- ECA Digital: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm

A revisão do público de 16/17 anos precisa abranger LGPD e a legislação digital vigente. Não presumir que uma checkbox genérica ou uma simples declaração de idade resolva todos os requisitos aplicáveis.

## Equipes e identidade — preparado em 15/10/2026

A demonstração privada ganhou departamentos, vínculos com aceite, convites de cadastro e médias/histórico de movimentações. O detalhamento e os limites estão em `../ORGANIZATION_TEAMS.md`.

Os módulos server-only `registration-identity.mjs` e `invitation-delivery.mjs` foram preparados e testados com dependências controladas. Eles ainda não estão conectados ao `account-access.mjs`, a uma API de organizações, a tabelas/RLS ou a uma fila real. Antes de ativar admissões, será necessário exigir a conclusão do cadastro documental no servidor também para quem criar conta diretamente pela API de Auth. O backend precisa garantir unicidade de documento por identidade, e-mail de acesso confirmado, autorização de gestão por organização e aceite exclusivamente pelo candidato correto. Não colocar CPF/CNPJ completo em user_metadata, mensagens ou URLs; dados de representação de organização não devem conceder papéis por autodeclaração.

Na etapa original de preparação de equipes, nenhuma migração ou conta/e-mail foi criado. O estado atual das migrações e da implantação está em `DEPLOYMENT_STATUS.md`. O adaptador de envio, sozinho, não habilita o cadastro externo.
