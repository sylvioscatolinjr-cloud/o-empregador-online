# Pesquisa externa Premium e assistente de posts — 23/10/2026

Autorização expressa do proprietário: pesquisa padrão e ampliada a R$ 2,50 por execução, recurso Premium em qualquer plano do próprio perfil. Posts de empresa e instituição são recurso comum de R$ 1,00. Sem mudança de mensalidades, percentuais, treinamentos, prioridade ou recargas. Proprietário designado permanece na quota exclusiva de 60 tentativas/dia sem débito da carteira; API tem custo real para o portal.

## Produto e limites

- Candidato: vagas e cursos públicos por objetivo, critérios profissionais e região informados. Não lê automaticamente currículo/anexo neste fluxo: envia somente critérios explícitos gerais. Revisão conectada ao currículo continua separada.
- Empresa: capacitação, eventos, instituições e canais públicos de divulgação de vagas/parcerias. Não pesquisa indivíduos ou currículos externos. Integração de candidatos privados/LinkedIn depende de acordos/API próprios e não foi implementada.
- Instituição: oportunidades para atrair alunos e matrículas, canais locais de divulgação, eventos e possíveis parcerias; ação e mensagem sugeridas. Não é um agente de colocação de alunos em empregos nem diretório de contatos pessoais.
- Posts para Empresa e Instituição: 3 legendas, chamadas para ação/matrícula, ideias de carrossel, roteiro curto e hashtags. Dados comerciais ausentes viram marcadores, sem inventar condições. Texto e ideias visuais, sem geração de imagem, agendamento, conexão de redes ou postagem automática.
- 20 recursos de Candidato e 21 em cada outro perfil, 62 no total. Novos cards mantêm estilo, seleção, ajuda e numeração existentes.
- Padrão: até 5 oportunidades e no máximo 3 chamadas da ferramenta; ampliada: até 10 e no máximo 5. Padrão R$ 2,50; ampliada R$ 5,00, sem garantir quantidade, atualidade absoluta ou resultado. Fontes inline clicáveis e horário de Brasília. Verificar condições na origem.
- Somente web pública pela ferramenta OpenAI; não há login externo, scraping de área restrita, envio de mensagem ou ação em fontes. Não consulta base interna OEO neste fluxo; busca interna existente permanece separada.

## Dinheiro e operação

Preço vem do catálogo no servidor, não do cliente. Premium exige aceite explícito, versão `2026-10-23-premium-search-v1`, modo válido e preço mostrado de 250 centavos. Saldo conferido em centavos, inclusive R$ 2,49 versus R$ 2,50. Recurso comum mantém 100 centavos e RPC original. RPC distinta `portal_ai_wallet_reserve_cost` service-only invoker aceita apenas 100/250, trava por usuário, consome plano por vencimento antes de recarga, impede duplicação da reserva e gasto acima do saldo, preserva devolução idempotente às fontes originais. Limite das linhas passa de 100 a 250; sem regravar valores reais existentes. Migração `20261023235334_premium_research_exact_wallet_cost` aplicada somente em produção.

Falha do provedor, resposta incompleta ou sem busca concluída e fontes válidas tenta devolver integralmente a reserva original. Falha de devolução gera referência para conferência administrativa; não alegar devolução sem sucesso da RPC. Uma resposta válida de pesquisa pode informar ausência de oportunidades; o preço é por solicitação. Frontend bloqueia envios concorrentes na sessão; não há cobrança ao selecionar, abrir ajuda/fontes ou salvar histórico. Não há cobrança automática recorrente de pesquisa/alerta. `AI_EXTERNAL_SEARCH_ENABLED=false` pausa novas pesquisas sem afetar carteira, posts e demais tarefas. Modelo usa `AI_EXTERNAL_MODEL` ou o `AI_CHAT_MODEL` já configurado. store:false, 2.800 tokens de saída, timeout65s e API120s; sem garantia de margem real.

Reversão: pausar pesquisa no servidor, reverter frontend/handler se necessário; conservar migração aditiva e linhas financeiras para auditoria/refundos. Não reduzir constraint enquanto houver linhas acima de 100. Assinaturas/topups existentes permanecem válidos.

## Dados, transparência e LGPD/ANPD

Revisados histórico disponível, LGPD vigente arts.6,7,18,33,46 e orientações ANPD de legítimo interesse. Finalidades: orientação profissional/educacional solicitada, divulgação autorizada e execução/conferência do consumo comprado. Para operação contratada do usuário, art.7,V é hipótese a avaliar; autorização de UI torna o envio/uso transparente e não substitui análise de transferência internacional ou todos os requisitos legais. Não invocar legítimo interesse para coletar leads pessoais, especialmente menores. Busca de organizações/canais públicos e critérios agregados evita essa coleta; dado público não é autorização irrestrita.

Dados mínimos: tema, profissão/competência, curso, região aproximada e condições comerciais fornecidas; não enviar automaticamente currículo, documentos, contas, ID Auth ou lista de alunos. Interface avisa antes do envio à OpenAI/pesquisa web; servidor limita consulta a1.500 caracteres e rejeita padrões de CPF/telefone/e-mail/senha e listas pessoais. Instruções tratam entradas/páginas como não confiáveis e proíbem extração de pessoas/dados sensíveis. Filtros são defesa adicional, não prova de anonimização; titular deve usar critérios gerais. URLs aceitas apenas HTTPS sem credencial/porta/IP/local; conteúdo e títulos escapados, sem HTML do provedor ou fetch de URL pelo portal.

Resposta/consulta não persistem automaticamente no portal; store:false não equivale a retenção zero no provedor. Histórico somente por decisão explícita e no escopo privado usuário/turma/perfil, editável por exclusão, até100 registros exibidos e cascade da conta conforme mecanismo existente. Pesquisa salva inclui fontes/data como texto. Registros financeiros mínimos de reserva/linhas seguem retenção/auditoria/direitos existentes, sem texto da pesquisa. Chaves ficam apenas no servidor e nunca nos logs, navegador ou fonte. Dados de cartão permanecem no Asaas. Posts não devem conter dados/imagens de terceiros sem autorização. Atendimento/direitos: master.sylvio@oempregadoronline.com.br. Não se declara conformidade jurídica integral.

Fontes oficiais consultadas:
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
- https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_hipoteses_legais_tratamento_de_dados_pessoais_legitimo_interesse
- https://developers.openai.com/api/docs/guides/tools-web-search
- https://developers.openai.com/api/reference/python/resources/responses/methods/create
- https://supabase.com/docs/guides/database/functions

## Validação

325 testes aprovados, zero falhas, um PDF privado ausente ignorado (326 total). Cobrem 6 combinações perfil/modo, preço/aceite/termos, isolamento, saldo insuficiente, pausa, fontes seguras, HTML escapado, falha/devolução, quota do proprietário, UI em centavos, posts nos fluxos comuns, débito fracionado98+152 e concorrência de quatro reservas Premium sobreR$10. Build local aprovado. Ensaio hospedado sintético com rollback confere débito250, devolução idempotente, bloqueios de acesso e overspend, sem alterações financeiras reais. Advisors sem novoWARN/ERROR; WARN preexistente de proteção de senha vazada.

Verificação pontual do provedor nesta publicação: duas pesquisas genéricas sobre SENAI e dois rascunhos fictícios de posts, sem dados pessoais ou débito de usuário. Verificação real concluída: pesquisa padrão retornou2 citações, ampliada4; posts de Empresa2.748 caracteres e Instituição2.809, ambos concluídos. Quatro chamadas reais, sem dados pessoais ou movimentação de carteira. Invocação temporária retirada do build; script mantido para execução operacional explícita, sem execução automática. Resultado real e publicação devem ser registrados no contrato de continuidade. Aceite visual autenticado no aparelho e qualidade de resultados do caso real permanecem necessários; não alegar automação completa dessa etapa.


## Preços por abrangência e bloqueio explícito — 30/10/2026

Pedido expresso de Sylvio: padrão até5 oportunidades R$2,50; ampliada até10 R$5,00. Substitui o preço único anterior somente para novas solicitações. Servidor calcula250/500 pelo modo e valida preço/aceite/termosv2 antes de reservar; respostas antigas não autorizam o novo preço. Interface atualiza botão, autorização e capacidade do saldo; trocar modo desmarca o aceite. Modo proprietário mantém quota sem débito. Campos pessoais/currículo completo continuam fora deste fluxo.

Botão desativado agora explica saldo insuficiente, serviço não validado, seleção ou operação em andamento. Não concede créditos nem altera dinheiro para testes. RPC de produção consultada já aceita100/250/500; nenhuma migração ou grant necessário. Cinco testes focados locais aprovados e sintaxe conferida; prévia antes do merge e qualidade real das vagas seguem verificações distintas.

Privacidade: mesma finalidade e dados mínimos; apenas modo/preço autorizado já enviados têm os novos valores. Sem nova coleta, fornecedor, retenção, acesso ou transmissão de currículo. Termos e Política atualizados para transparência. Consulta oficial Supabase sobre funções concluída; fontes LGPD/ANPD e changelog indisponíveis na ferramenta de consulta nesta sessão, sem alegação de revisão jurídica completa. Preservados direitos/canal de atendimento. Nenhuma execução paga ou débito real usado para validar.


## Evidência na comparação profissional — 30/10/2026

Após teste real relatado e capturas do titular, instrução da pesquisa externa reforçada: requisitos não se tornam qualificações do usuário; curso não comprova domínio avançado; experiência não infere AutoCAD/PDM/NR-12/BOMs ou outros conhecimentos. Comparação de até3 requisitos prioritários por oportunidade com evidência citada do texto fornecido, compatível/informação não fornecida/divergência declarada. Não estima chances de contratação, mesmo sob pedido. Dados declarados não são comprovados. Links específicos e disponibilidade incerta devem ser distinguidos; duplicatas agrupadas. Texto simples com rótulos, sem Markdown cru.

Sem mudança de modelo, preços, carteira, quota, dados enviados ou permissões. Sintaxe e preservação de preços/abrangência/fontes obrigatórias conferidas localmente, sem API paga. Instruções não garantem obediência integral; novo teste real de qualidade com perfil fictício continua necessário. Não afirmar verificação independente dos anúncios: titular relata que links permitem candidatura; consulta externa da sessão falhou.

Mesma finalidade/dados mínimos/retensão/direitos já descritos; sem nova coleta ou tratamento de currículos. Revisão oficial LGPD/ANPD tentada na sessão, ferramenta indisponível; sem certificação jurídica. Publicação segue PR e prévia.

## Resultado legível e proteção contra regressão — 30/10/2026

A regra de evidência do commit cd0ded7 já está em produção. Esta revisão complementa a interface: blocos semânticos por oportunidade, títulos/listas, negrito e links Markdown legados interpretados por uma lista restrita; HTML do provedor permanece escapado. Endereços HTTPS específicos usam rótulo curto, citações mantêm índices e fontes, sem links aninhados. URLs com credenciais, locais e protocolos não HTTPS não viram links. Layout responsivo sem pre-wrap herdado nos blocos. Histórico informa preço da tarefa/modo antes da nova confirmação, em vez de preço fixo R$1.

Proteção adicional do servidor rejeita rótulos explícitos de chance/probabilidade de contratação alta/moderada/baixa ou percentual. A rejeição entra no caminho de falha e devolução já existente; não é verificação completa de todas as afirmações do modelo. Declarações do usuário permanecem distintas de comprovação documental. O currículo salvo não é enviado automaticamente neste fluxo.

Privacidade: finalidade, critérios mínimos e hipótese contratual a avaliar permanecem os descritos acima; sem nova coleta, persistência, acesso a dados de terceiros ou mudança de retenção/direitos. Fontes oficiais revistas nesta sessão: catálogo de materiais educativos da ANPD acessível; consulta ao texto compilado do Planalto bloqueada na origem. Preservadas as regras documentadas de minimização, transparência e isolamento; não se declara conformidade jurídica integral.

Validação local: 51 testes específicos de API, três perfis/dois modos, preços, UI, histórico, escape/links, formatação e devolução passaram. Build aprovado. Teste real autenticado e resultado de implantação serão registrados separadamente; testes unitários não comprovam vigência de anúncios externos.
