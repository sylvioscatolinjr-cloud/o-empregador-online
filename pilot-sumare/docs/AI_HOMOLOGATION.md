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
