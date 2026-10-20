# Estado da ativação — 15/10/2026

## Banco hospedado

- Projeto: **O Empregador Online**, `mynjocetbsiaukefhkmz`, organização Sylvio Scatolin.
- Estado encontrado: saudável, PostgreSQL 17.11; região `us-east-2` (a região criada pelo proprietário foi preservada).
- Migrações aplicadas: `20261015210327_pilot_accounts_profiles_and_goals` e `20261015211042_pilot_reference_indexes`. Os arquivos locais usam as versões retornadas pelo histórico do servidor.
- Sete tabelas com RLS: turmas, vínculos, perfis, metas e, no esquema privado, identidades, convites e eventos de ingresso.
- Turma preparada para até 300 alunos, datas 05 e 06/11/2026. Nome oficial da unidade e liberação operacional seguem pendentes. Ingresso, confirmação de entrega e aprovações continuam desabilitados.
- Teste de isolamento executado no Supabase real: `tests/hosted-isolation.sql`. Verificou acesso ao perfil próprio, bloqueio a perfil/meta alheios, bloqueio a alteração de papel/identidade pelo cliente e bloqueio de contas suspensas/anônimas. Todas as linhas fictícias, inclusive no Auth, foram revertidas; nenhum e-mail foi enviado.
- Advisors de segurança: nenhum ERROR/WARN; três avisos INFO por RLS sem política de cliente nas tabelas privadas. O bloqueio integral é deliberado: operações passam por funções restritas. [Explicação do aviso](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Foram adicionados índices para as três chaves estrangeiras apontadas na primeira consulta de desempenho. Índices ainda sem uso são esperados num banco novo e vazio; não foram removidos.

## Aplicação

- Projeto Vercel criado: **o-empregador-online-piloto**, `prj_blDRD8MpBS3n0SXRDmEAYz6Lgv0z`.
- Implantação de produção retornou **READY**, com origem https://o-empregador-online-piloto.vercel.app. Após a autorização de 15/10 às 18h32 (Brasília), foram confirmadas respostas HTTP 200 anônimas na página inicial e em `/api/config`, sem redirecionamento ao login da Vercel. Isso verifica a entrada pública, mas não certifica o fluxo de contas.
- A origem oficial da aplicação foi configurada nas variáveis de produção, junto da URL/chave publicável Supabase e turma. `PILOT_EMAIL_ENABLED=false` mantém o cadastro desabilitado.
- A conexão conseguiu configurar as variáveis públicas do Supabase, a turma e o bloqueio de e-mail usando o mesmo contexto de conta da criação. Solicitações com seletor explícito da equipe retornaram 403; não foi trocada a conta ou o projeto para contornar isso.
- Chaves privadas de servidor e SMTP não foram obtidas nem expostas. Conclusão documental e envio de e-mail ainda dependem desses valores configurados diretamente nos painéis.
- A proteção nativa Vercel Authentication/SSO foi retirada pela API oficial após a autorização explícita do proprietário em 15/10/2026 às 18h32 (Brasília). Uma leitura posterior confirmou `ssoProtection.enabled=false`. As recusas anteriores não foram contornadas; a mudança só foi feita após a nova autorização. O ingresso permanece fechado e o Supabase continua exigindo autenticação e autorização para os dados.
- O portal demonstrativo Sites continua público por link e separado desta nova aplicação de contas. Criar o banco não converteu os módulos demonstrativos em operações compartilhadas reais.

## Para habilitar as contas de teste

1. Configurar SMTP e manter confirmação de e-mail obrigatória no Supabase; cadastrar origem e URLs de confirmação/recuperação da aplicação implantada.
2. Inserir chave secreta e segredo HMAC nas variáveis de servidor Vercel, sem enviá-los nesta conversa. Habilitar a interface somente depois de verificar entrega de confirmação e recuperação.
3. Entrada sem login Vercel autorizada e verificada. Falta configurar o domínio próprio e validar o fluxo de conta completo quando os serviços estiverem prontos.
4. Fazer o ensaio real entre contas/aparelhos e depois integrar os demais módulos e executar carga/concorrência antes de admitir a turma inteira.
