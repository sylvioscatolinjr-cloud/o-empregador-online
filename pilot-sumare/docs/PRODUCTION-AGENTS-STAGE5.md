
> Atualização de 22/10/2026: este registro conserva o histórico da preparação. O pagamento real e os agentes já foram publicados; execução, histórico e revisão/salvamento/persistência do currículo foram confirmados pelo titular. Renovação futura, cancelamento/estorno real e contratação pública continuam sem aceite final. Estado atual consolidado em NEXT-STAGE-CHECKLIST-20261022.md.

# Etapa 5 — publicação controlada dos agentes, 22/10/2026 UTC

## Escopo da versão

Integra feature/oeo-ai-agents com as duas correções financeiras já publicadas em main. Mantém os 54 recursos guiados (18 por perfil, seis por nível, cumulativos), menu expansível com padrão visual dos controles, bloqueios por assinatura verificada no servidor, revisão conectada ao currículo/anexo e salvamento seletivo, histórico privado opcional e carteira com reserva/devolução. Demais recursos usam o texto profissional/agregado informado pelo usuário, sem busca automática de mercado ou ações externas.

Corrigida incompatibilidade entre a compra de plano Candidato pelo proprietário e os agentes: papel pilot_owner, confirmado pelo servidor, usa escopo pessoal learner apenas dentro dos handlers dos agentes. Plano continua sendo o próprio, verificado por valor/período/perfil; não ganha gratuidade, níveis extras ou tarefas de empresa/escola. Currículo e histórico filtrados pelo próprio UUID/turma e perfil pessoal. Não muda vínculo no banco nem permissões administrativas. Interface inclui Meus agentes para proprietário. Planos e pacotes passa a abrir /assinatura.html diretamente, com aparência compartilhada dos botões vizinhos.

Produção usa mynjocetbsiaukefhkmz e turma 5d36b59c-4fec-45e1-a74a-c2423a16c3fe. Migração de revisão/histórico 20261021232120 já aplicada e conferida. Nenhuma nova migração nesta publicação. Variáveis Production AI_CHAT_MODEL=gpt-4.1-mini e AI_CHAT_METERING_ENABLED=true conferidas; Secrets presentes, valores não consultados. Entrada alternativa de homologação não habilitada em Production. Templates/SMTP e contas reais preservados. Histórico da homologação não é copiado.

## Verificação e limites

Suíte geral: 209 aprovados, zero falhas, um PDF privado indisponível ignorado. Inclui cinco regressões do proprietário: catálogo sem liberação gratuita, carteira própria, tarefa paga com recusa de nível superior/outro perfil, histórico privado e currículo próprio com consentimento. Após ajuste do link de assinatura, testes de navegação repetidos e build local aprovados. Ensaio financeiro anterior confirmou pagamento real de R$ 19,90, Nível 1 e R$ 3,98 sem gasto; publicação não cria compra, consumo ou cancelamento.

Após implantação conferir /conta.html, /assistente.html, /assinatura.html e scripts no domínio HTTPS; endpoints privados sem sessão devem responder 401; rota desconhecida 404. Harness de revisão só em Preview. Validar uma tarefa com login do titular no próprio navegador: abrir Meus agentes, conferir seis disponíveis no Nível 1, executar uma tarefa explicitamente; resposta completa deve debitar R$ 1,00, deixando R$ 2,98. Falha no fornecedor deve devolver a reserva. Não declarar chamada real de IA em Production comprovada apenas por build/Secret presente. Conteúdo/entrega de email, avaliação qualitativa das 54 funções, renovação/cancelamento/estorno real e abertura de compras ao público têm validações próprias pendentes. Contratação continua restrita ao proprietário nesta versão.

## Reversão e observabilidade

Ponto anterior de produção: commit 8f9bc043bfb44e85968b7a985de7f90017978aa0, implantação dpl_HeJRL2G2o7bWjQSFW3jr18zYwjew. Em regressão material, reverter implantação para esse ponto; não apagar histórico/colunas/RPC nem desfazer pagamento. RLS e privilégios já são restritivos e compatíveis com código anterior. Conferir erros de runtime e o saldo após implantação. Não há coleta de sessão/token pelo agente de manutenção para testes.

## Privacidade

Finalidade: prestar orientações e revisão solicitadas pelo titular, com controle de assinatura e créditos. Hipótese de trabalho: execução contratual para funções solicitadas; autorização específica da interface informa o envio de texto profissional à OpenAI. Nenhum currículo é enviado ao modelo ao abrir menu ou carregar fontes. Dados mínimos, expurgo de identificadores da revisão, store:false, respostas escapadas, histórico opcional/excluível, salvamento por escolha e isolamento já descritos em CONNECTED-RESUME-REVIEW.md e EXPANDED-AGENT-FUNCTIONS.md mantidos. Texto livre pode conter informação pessoal fornecida pelo usuário, sem promessa de anonimização absoluta. Carteira conserva registros necessários à conciliação; pedidos de direitos pelo atendimento existente, com prazos financeiros a definir pelo controlador antes da abertura comercial. Não altera ranking nem concede consulta de dados alheios pelos agentes. Não certifica conformidade jurídica integral.

Fontes oficiais consultadas: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm ; https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-vf.pdf ; orientações de implantação Vercel em https://vercel.com/docs/deployments .
