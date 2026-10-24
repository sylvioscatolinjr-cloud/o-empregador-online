# Agente de Publicações — aplicação aprovada em 23/10/2026 (Brasília)

Aprovado após prévia interativa: três perfis, imagem e texto independentes, proporções1:1/4:5/9:16/16:9, imagem intermediáriaR$2,50 e altaR$5, textoR$1. Criação livre, logo/referência opcionais e avisos de alteração de letras/logo/cores, sem transferência fictícia de toda responsabilidade para OpenAI. Publicação nas redes é manual; não há OAuth social, vídeo, calendário de postagem ou postagem automática.

## Produto

Novo recurso `publication_learner/recruiter/school_staff` abre `/publicacoes.html`, no mesmo padrão visual dos controles. Mantidos todos os anteriores: 21 recursos de candidato,22 de empresa,22 de instituição (65 total). Texto segue chat e histórico privados existentes, sujeito ao próprio perfil e confirmação deR$1. Candidato: carreira/apresentação profissional, sem conquistas inventadas. Empresa: produtos/serviços/atividades. Instituição: cursos/atividades/captação de alunos, sem listas de pessoas.

Imagem usa API Images OpenAI, modelo padrão versionado `gpt-image-2.5-flare-2026-09-08`, podendo ser configurado em `AI_IMAGE_MODEL` somente na família compatível. Quality medium/high, uma imagem por pedido. Tamanhos exatos1024x1024,1024x1280,864x1536,1536x864 respectivamente. Dimensões/tipo/tamanho PNG verificados antes de guardar. Sem recorte posterior ou sobreposição determinística de logo; a IA compõe livremente e pode alterar identidade/texto. Input sem referências usa generations; referências PNG normalizadas usam edits multipart. Não faz fetch de URL informada pelo usuário.

## Dinheiro, idempotência e falhas

Preço e opções fixados no servidor, consentimento e versão `2026-10-23-publication-v1`. Cada pedido recebe UUIDv4. RPC invoker service-only `portal_ai_image_reserve` confere Auth confirmado/não bloqueado, membership ativo/não fictício/turma/perfil e reserva250/500 centavos em transação com criação do job. Usa plano por vencimento antes de recarga, sem dinheiro sintético. Job duplicado com mesmos proprietário/perfil/opções é retornado sem chamar API outra vez. Outro usuário/qualidade/opções não reutiliza o ID. Índice único permite só um job processing/review por usuário/turma, inclusive entre perfis de teste do proprietário.

Proprietário: ID privado configurado + papel real conferidos no servidor. Usa apenas `portal_owner_test_reserve`, parte dos mesmos60 testes/dia e sem débito na carteira; custo real da OpenAI pertence ao portal. Não há quota gratuita para outros IDs. A função do banco também exige pilot_owner quando p_owner=true; parâmetro nunca vem do navegador.

- Recusa HTTP400/401/403/404/422/429: função atômica `portal_ai_image_fail` devolve a reserva uma vez e marca failed; teste do proprietário continua contabilizado.
- Timeout, HTTP5xx, resposta inválida ou erro ao persistir: review, sem nova chamada nem estorno automático presumido. Histórico orienta não repetir e atendimento com referência. O pedido permanece reservado até conciliação. Host encerrado à força pode deixar processing, igualmente bloqueado até investigação.
- Falha de rede no cliente: consultar histórico; servidor pode ter concluído e guardado a imagem. Novo envio não é feito automaticamente.
- Resultado concluído mas indesejado: nova geração exige nova confirmação de preço. Direitos legais preservados; não alegar que toda insatisfação autoriza negar direitos nem que estorno OEO implica estorno de API.

Conciliação administrativa ainda é operacional: conferir arquivo privado em user/id.png, status de consumo e atendimento; usar ferramentas de serviço com escopo e evidências. Se o arquivo existe após falha de persistência, reparar job e entregar sem nova geração. Sem entrega após apuração, devolver às fontes originais por rotina transacional adequada e encerrar job; custo de API eventual é do OEO. Não autorizar reexecução cega. Não há botão automático de conciliação financeira administrativa nesta versão.

## Arquivos privados e dados

Tabela `portal_ai_image_jobs` e bucket `oeo-ai-images` privados/service-only, sem grants/policies de navegador; Auth/turma/perfil conferidos para listar, assinar ou excluir. Arquivo PNG até8MB, path calculado do ID Auth e UUID, upload não substitui arquivos e cacheControl0. Resposta não carrega base64 (evita limite de resposta/megabytes no cliente), só URL assinada60s do próprio arquivo. Links são renovados gratuitamente, preview/download sem novas execuções. Exclusão requer confirmação, apaga arquivo e limpa path no job; metadata financeira mínima permanece. Referências e pergunta não são persistidas nos jobs. O resultado fica até exclusão pelo usuário/atendimento; não se promete expiração automática. Pedido de exclusão da conta exige remoção dos arquivos pelo atendimento antes/depois do cascade dos jobs, para evitar órfãos; rotina de apagamento global automático de arquivos ao excluir Auth não foi adicionada.

Frontend recebe dados só de API autenticada, verifica identidade pré/pós e limpa conteúdo ao mudar sessão. Aceita URL de resultado apenas do origin Supabase configurado e prefixo privado esperado, textos escapados, clipboard explícito. Não grava imagens/tokens em localStorage nem service worker. Histórico de texto é opcional e independente; referência original não volta a ser enviada automaticamente ao texto.

LGPD/ANPD e histórico revistos: finalidade é criação de conteúdo autorizada/solicitada e execução/conferência de compra. Dados mínimos: tarefa, duas referências reduzidas opcionais, configuração e resultado; sem importar currículo/cadastro/alunos silenciosamente. Hipótese art.7,V para serviço solicitado deve ser avaliada junto com direitos de imagem, transferência internacional art.33 e obrigações do controlador; consentimentos de interface não substituem toda análise. Evitar pessoas/dados sensíveis e menores sem autorização; não identificar pessoas. OpenAI recebe conteúdo informado, não ID Auth ou e-mail em prompt. Não há declaração de retenção zero no provedor ou certificação jurídica integral. Atendimento/direitos: master.sylvio@oempregadoronline.com.br.

Avisos atendem transparência e não afastam direitos: CDC arts.6,14,25,51. Não prometer que a OpenAI assume integralmente a responsabilidade do OEO. Custos de falhas precisam entrar na margem, que não foi garantida pelos testes.

Fontes oficiais consultadas:
- https://developers.openai.com/api/docs/guides/image-generation
- https://developers.openai.com/api/reference/resources/images/methods/edit
- https://supabase.com/docs/guides/storage/security/access-control
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
- https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm
- https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_hipoteses_legais_tratamento_de_dados_pessoais_legitimo_interesse

## Entrega e testes

Migração de produção20261024023538 (horário UTC do banco;23/10Brasília): private_publication_images_and_exact_generation_costs. Amplia linhas até500 e RPC de custo para100/250/500, preserva as versões normais e pesquisa Premium. Reversão: pausar `AI_IMAGE_GENERATION_ENABLED=false`, preservar leituras/arquivos/linhas financeiras; não reduzir constraint com linhas de500 nem descartar jobs em aberto. Migração aditiva não foi aplicada na homologação.

348 testes gerais aprovados, zero falhas, um PDF privado ausente ignorado (349 total). Dezesseis focados finais e build aprovados. Cobrem seis combinações perfil/qualidade, preços/aceite, idempotência, privado, referências multipart, falhas certas versus incertas, reserva500/refund/overspend/isolamento/clientes negados em PGlite, quatro proporções e estados de UI. Ensaio hospedado sintético com rollback aprovado; sem alterações financeiras reais e sem resíduos esperados. Advisors sem novosWARN/ERROR (INFOservice-only intencional eWARNpreexistente de proteção de senha vazada).

Verificação real pontual do provedor e entrega privada preparada no build desta publicação: exemplos genéricos em medium4:5 com referência sintética e high16:9 sem referência, upload privado, URL assinada, acesso público negado e remoção do arquivo temporário. Não usa conta/carteira do titular, não publica mensagens ou dados pessoais. O gatilho será removido após confirmação; resultado deve ser registrado no contrato. Teste real autenticado no aparelho do titular permanece para aceite visual, não se alega automatizado.
