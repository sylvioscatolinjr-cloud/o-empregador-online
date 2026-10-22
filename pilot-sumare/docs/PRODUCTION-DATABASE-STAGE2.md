# Etapa 2 — banco de produção, 21/10/2026

Sylvio concluiu a conferência visual do menu e do encaminhamento dos recursos bloqueados nos três perfis através de capturas e autorizou seguir à etapa 2: preparar o banco de produção para a revisão conectada e o histórico privado. Isso não constitui homologação de pagamento, execução qualitativa das 54 tarefas ou autorização de publicação no domínio nesta etapa.

## Escopo aplicado

Projeto de produção: mynjocetbsiaukefhkmz. Comparado com homologação xxirjbsbfxwzplrcbbjt. Produção já continha as colunas necessárias do currículo, as tabelas financeiras e as funções de reserva/estorno de créditos. Faltavam somente portal_ai_apply_resume(uuid,jsonb,jsonb) e portal_ai_notes.

Migração registrada no banco de produção: **20261021232120_ai_resume_review_and_private_history**. Arquivo inicialmente gerado pelo Supabase CLI 2.121.0 com migration new, preenchido com os dois SQL já testados na homologação; após aplicação remota, nome do arquivo alinhado à versão efetivamente registrada pelo serviço de migrações. Conteúdo reproduz a função e tabela de db/ai-resume-review.sql e db/ai-history.sql, com limites locais de lock 3 s e operação 30 s. Aplicação remota transacional, sem gravação de dados pessoais ou concessão de créditos. Novo teste local executa a própria migração, verifica que contém ambos os SQL de referência e testa as proteções.

- RPC com SECURITY INVOKER, search_path vazio e execução exclusiva por service_role; não autoriza chamadas diretas do navegador. Alterações limitadas às seções profissionais permitidas, com comparação do snapshot e lock da linha para impedir sobrescrita de edição posterior. Contato, nome, anexo original e campos não selecionados preservados.
- Histórico privado com RLS habilitada, todos os grants de PUBLIC/anon/authenticated revogados, somente SELECT/INSERT/DELETE do serviço. API existente valida sessão confirmada/ativa e restringe cada operação a usuário/turma/perfil; não há acesso de proprietário/organização ao histórico alheio. Exclusão da conta remove as notas por FK cascade. Nenhum SECURITY DEFINER introduzido.
- Sem alteração em contas, perfis, vínculos, tabelas financeiras, autenticação, chaves, variáveis de ambiente ou políticas anteriores. Sem habilitar checkout, mudar plano ou publicar a nova aplicação no domínio oficial.

## Verificação e preservação

Suíte final: 201 testes aprovados, zero falhas e zero ignorados. Inclui teste PostgreSQL local da migração e regressões de currículo, histórico, assinatura e isolamento. Nenhum código da aplicação mudou nesta etapa.

Ensaio primeiro com DDL e dados fictícios em BEGIN/ROLLBACK no próprio projeto de produção; função e tabela persistidas somente após esse ensaio passar. Repetido depois da aplicação usando tests/hosted-ai-production-stage2.sql: salvamento seletivo, proteção contra snapshot antigo, preservação de campo não selecionado e contato, rejeição de chave indevida, criação/leitura/exclusão de nota pelo serviço, RLS e ausência de privilégios de cliente. Dados fictícios e usuário temporário revertidos; nenhum e-mail, chamada OpenAI ou pagamento realizado.

Baseline e verificação posterior, sem extrair conteúdo privado para os relatórios:

| Verificação | Antes | Depois |
|---|---:|---:|
| Perfis | 54 | 54 |
| Vínculos | 154 | 154 |
| Pedidos financeiros | 0 | 0 |
| Pagamentos | 0 | 0 |
| Créditos registrados, centavos | 0 | 0 |
| Créditos consumidos, centavos | 0 | 0 |
| Notas no histórico novo | tabela ausente | 0 |
| Usuários do ensaio após rollback | 0 | 0 |

Digest agregado dos perfis idêntico antes/depois, comprovando que seus campos não foram alterados. Hash é usado apenas para comparação técnica; não registra currículo, contato ou documento no repositório.

Advisors antes/depois: zero novo WARN/ERROR. INFO RLS Enabled No Policy passa de 19 para 20 pela tabela service-only, intencional com grants de cliente revogados. Aviso preexistente Leaked Password Protection Disabled permanece, fora desta alteração: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection .

## Privacidade e operação

Fontes oficiais consultadas: LGPD compilada do Planalto (arts. 6, 7, 18 e 46), guia ANPD sobre segurança da informação para agentes de pequeno porte e documentação Supabase de RLS. Finalidades: melhorar redação profissional mediante solicitação e guardar orientação escolhida para continuidade privada. Dados mínimos definidos nos fluxos existentes; hipótese de execução da prestação solicitada (art. 7º, V), sujeita à avaliação do controlador. Salvamento do histórico opcional, visível e sujeito à revisão; retenção até exclusão de registro/conta. Atendimento e direitos já expostos pelo portal preservados. Texto livre pode conter dados sensíveis indevidos: orientação de minimização e revisão permanece, sem promessa de anonimização ou conformidade jurídica integral. Nenhum novo compartilhamento ou uso de dados de produção pelo modelo nesta etapa.

Fontes:
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
- https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-vf.pdf
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/changelog.md (índice consultado; sem alteração pertinente às duas estruturas)

Reversão operacional antes da publicação: manter aplicação anterior no domínio; a nova tabela permanece vazia e sem acesso de clientes. Não remover estruturas automaticamente depois de começarem a receber notas; qualquer retirada futura precisa preservar o histórico e respeitar a retenção/solicitações dos titulares.

Próxima etapa: conferir configuração de produção (etapa 3), seguida de validação financeira (etapa 4) e publicação/teste do domínio (etapa 5). Banco preparado não equivale a esses fluxos concluídos.

A listagem de migrações pela CLI no PostgreSQL local não pôde conectar em 127.0.0.1:54322 (instância local ausente). A verificação local foi feita com PGlite e a versão aplicada foi conferida diretamente em supabase_migrations.schema_migrations no projeto de produção; não se afirmou sucesso de listagem local inexistente.
