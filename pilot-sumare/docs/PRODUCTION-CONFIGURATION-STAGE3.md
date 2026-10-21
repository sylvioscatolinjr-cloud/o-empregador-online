# Etapa 3 — conferência de produção, 21/10/2026

Escopo autorizado: conferir domínio, autenticação, conexão/credenciais da IA, créditos e separação entre homologação e produção. Conferência via conectores Vercel/Supabase e requisições públicas sem sessão. Não confundir presença de Secret com teste de conexão válido ao fornecedor.

## Evidência observada

| Item | Produção | Homologação |
|---|---|---|
| Origem configurada | https://www.oempregadoronline.com.br | branch feature/oeo-ai-agents no Vercel |
| Projeto Supabase | mynjocetbsiaukefhkmz | xxirjbsbfxwzplrcbbjt |
| Turma | 5d36b59c-4fec-45e1-a74a-c2423a16c3fe | 5956c4b2-ac81-449b-ac7f-6b1314a93e59 |
| /api/config | 200, ready:true | 200, ready:true |
| Cadastro público | aberto, preservado | fechado, preservado |
| Entrada alternativa de teste em produção | ausente | variável restrita à branch, sem ativação alternativa com ready:true |
| Supabase Secret e OpenAI Secret | entradas Sensitive exclusivas de produção | outras entradas Sensitive exclusivas da branch |

Domínios apex e www verificados no Vercel. HTTPS validado por cliente HTTP padrão; apex respondeu 308 para https://www.oempregadoronline.com.br/. Página conta.html respondeu 200; API de assinatura sem sessão respondeu 401. Auth /settings do projeto de produção respondeu 200: provedor email habilitado, cadastro habilitado e mailer_autoconfirm=false. Não foi enviado e-mail, lido token de acesso ou efetuado login para esse teste público.

Última implantação do domínio observada continua em main, commit 29a472b70023330f031fdb4649ea9a3509f6ebca, deployment dpl_4aEGwGxcAAYJHjgKhqhXK7bCgaxM READY. API nova de agentes no domínio ainda responde 404 porque o código da branch não foi publicado ali; isso é pendência de etapa 5 e não prova falha da chave OpenAI.

## Correções preparadas

As variáveis abaixo existiam somente na homologação e foram criadas em Production, tipo Config/plain:
- AI_CHAT_MODEL=gpt-4.1-mini
- AI_CHAT_METERING_ENABLED=true

Listagem posterior confirmou valores e escopos. Variáveis só entram em futuras implantações; nenhuma publicação ou redeploy em produção foi feito. Modelo atual da homologação preservado. OPENAI_API_KEY, SUPABASE_SECRET_KEY, chaves Asaas e demais Secrets não foram copiados, substituídos ou revelados. Conferência de cadastro da chave não equivale a validação de acesso ao modelo, cota ou conexão de runtime; conferir na publicação controlada antes de declarar IA operacional em produção. Nenhum crédito sintético foi transportado e nenhuma compra foi liberada por essas variáveis.

## Pendência para concluir a etapa 3

A conexão Supabase disponível oferece banco e projetos, mas não leitura/edição das configurações privadas do Auth. Navegador em nuvem do titular indisponível nesta etapa, conforme bloqueio anterior. É necessário conferir, por captura do painel do projeto de produção, Authentication → URL Configuration:

Site URL esperado para o modelo novo: https://www.oempregadoronline.com.br

Retornos necessários na lista:
- https://www.oempregadoronline.com.br/conta.html
- https://www.oempregadoronline.com.br/conta/confirmar
- https://www.oempregadoronline.com.br/conta/recuperar

Conferir preservando retornos existentes legítimos. Não substituir SMTP nem enviar mensagem de teste sem solicitação específica. Modelo de recuperação com fragmento exige página compatível publicada antes da troca do template; o template de produção não foi alterado agora. Configuração completa de SMTP/templates e entrega real não foram verificadas neste turno; somente provedor email e confirmação obrigatória foram observados. Não marcar a etapa 3 integralmente concluída antes da revisão de retornos. Após essa revisão, a entrega/fluxo de acesso será verificada no ensaio da publicação, com intervenção do titular para credenciais.

Conferência do registro da turma confirmou sua existência e flags institucionais ainda false (admissions_open, school_approved, privacy_approved, minors_approved, email_delivery_verified). Flags preservadas; cadastro público do portal não constitui autorização institucional para o piloto SENAI.

## Privacidade

Finalidade: preparar configuração do serviço solicitado. Dados mínimos de metadados de ambiente, URLs, chaves públicas e booleanos; nenhuma consulta de currículo ou conteúdo de usuário. Bases e atendimento existentes preservados; sem nova coleta, retenção de conteúdo, credencial exportada ou mudança de permissões/RLS. Somente o modelo e chave de ativação de créditos não sigilosos foram adicionados ao escopo Production. Risco de mistura de ambientes reduzido por conferência de banco/turma/origem; risco de falso sucesso mitigado distinguindo Secrets presentes de testes reais. Não representa conformidade jurídica integral.

Fontes oficiais consultadas: https://vercel.com/docs/environment-variables ; https://supabase.com/docs/guides/auth/redirect-urls ; LGPD compilada do Planalto e guia ANPD sobre segurança da informação nas URLs registradas em PRODUCTION-DATABASE-STAGE2.md.
