# Assistente editorial — 17/10/2026

Implementado: área privada `/editorial.html` com link exclusivo no painel do proprietário; API valida token, confirmação de e-mail e vínculo ativo `pilot_owner` no servidor. Pesquisa guiada por temas, referências oficiais recuperadas pelo provedor, justificativa, público, edição e histórico. Envio transacional e idempotente ao blog somente como rascunho. O editor existente controla a publicação.

Limites transacionais por turma: uma tentativa de pesquisa por dia e três de rascunho por semana, no horário de Brasília. Falhas também contam, pois podem consumir créditos. Cada chamada limita busca a três chamadas de ferramenta e saída a 6.000 tokens. Isso limita chamadas, não é um teto financeiro; definir orçamento no provedor antes de ativar. Nenhuma repetição automática de chamada cobrada.

Cron preparado às 11h UTC (8h de Brasília). Pesquisa diária e prepara um rascunho às segundas/quartas/sextas, se houver pauta nova e cota disponível. Acionamentos manuais compartilham a cota. A rotina fica pausada por padrão e nunca publica.

## Banco aplicado

Supabase existente `mynjocetbsiaukefhkmz`, migração `20261017201740_owner_editorial_agent.sql`. Tabelas com RLS, escrita e funções reservadas ao serviço; leitura restrita ao proprietário ativo. Teste `tests/hosted-editorial.sql` passou no banco hospedado e reverteu os dados fictícios. Verificou isolamento, limite diário e transferência idempotente como rascunho privado.

Advisors não apontaram problemas nas novas tabelas/funções. O projeto já tinha proteção contra senhas vazadas desativada: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection .

## Publicação e ativação

A aplicação do domínio está no projeto Vercel `prj_blDRD8MpBS3n0SXRDmEAYz6Lgv0z`, equipe `team_yQbTAdddoLaIQyVfZnzIXAKw`. O conector devolvia HTTP 403 quando recebia teamId explícito. Em 17/10, a consulta pelo ID exato do projeto sem teamId funcionou e confirmou accountId igual à equipe esperada. Consulta de variáveis e criação de implantação também funcionaram dessa forma. Não repetir consultas com o parâmetro que falha; validar sempre a identidade exata do projeto retornado. Não há credencial/modelo editorial cadastrados em produção, portanto a geração real permanece indisponível e a rotina pausada. O Sites principal serve o laboratório: não substituir a aplicação do domínio por esse Worker.

Configurar diretamente na hospedagem, sem valores no chat ou no Git:

- `OPENAI_API_KEY`: credencial dedicada à redação, com orçamento no provedor.
- `EDITORIAL_AI_MODEL`: modelo compatível com Responses API e web_search; não há modelo padrão silencioso.
- `CRON_SECRET`: segredo aleatório para autenticar o agendador.
- `EDITORIAL_SCHEDULE_ENABLED`: ausente/false mantém pausado; true apenas após teste real.
- Reutilizar `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `PILOT_COHORT_ID`, `APP_ORIGIN` já usados pela administração.

Implantação editorial READY, aliases www e sem www atribuídos, sem erro: `dpl_CuFgk9d6pHFuqLhm6SaKC4gALrWg`, fonte `208562103cd785ad13b9a00498d49d644cf362e3`. Depois de confirmar READY e os aliases de produção: verificar login do dono e bloqueio dos demais perfis; pesquisar, conferir as referências, gerar um rascunho e transferir ao blog, confirmando que continua privado. Exercitar o cron com sua autorização de serviço e ler o resultado persistido antes de habilitar a rotina. Configuração de cron, sozinha, não comprova execução.

## Testes

`npm test` e `npm run build` em `pilot-sumare`. A geração usa respostas simuladas nos testes locais: não comprova credencial, disponibilidade de modelo nem precisão factual. Não houve ensaio de navegador nesta entrega. Validar referências não certifica cada afirmação; toda matéria exige revisão humana. Entrevistas reais nunca são inventadas, e legislação deve distinguir proposta, publicação e vigência.
