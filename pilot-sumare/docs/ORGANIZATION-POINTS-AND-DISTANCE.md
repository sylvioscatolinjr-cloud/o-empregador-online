# Médias profissionais e proximidade — 22/10/2026

## Comportamento entregue
- Página inicial e anúncios: destaque, plano pago vigente, média profissional da organização, ordem alfabética. Dentro da busca autenticada, um CEP de referência opcional acrescenta distância antes da alfabética. Nenhuma origem é presumida para visitantes anônimos.
- Currículos: destaque, plano pago vigente, pontos profissionais comprovados, proximidade opcional, nome e ID. Proximidade só usa região expressamente autorizada pelo candidato; não consulta o CEP do currículo privado. Filtros por texto, cidade e SENAI são preservados. A ordenação ocorre antes de paginar.
- Área da organização e Departamentos e equipe: média geral e por departamento, número de pessoas no cálculo e explicação. Cada pessoa conta uma vez na organização, mesmo em dois setores. Sem formação profissional validada, conta zero; sem membros elegíveis, média indisponível. Sem captura de histórico ou indicador de variação nesta versão.
- Somente vínculos aceitos, membros ativos/confirmados e cartões públicos autorizados entram na média. Dados pessoais, intelectuais e espirituais e convites pendentes ficam fora. Retirar o cartão público, encerrar vínculo ou invalidar comprovação repercute na próxima consulta.
- Autorização da região: Meu espaço → Meu cartão na página inicial → Proximidade nas buscas. A consulta do CEP é explícita; o servidor arredonda coordenadas a uma casa decimal (escala aproximada de 10 km) e descarta o CEP. GET retorna apenas enabled; não há endpoint de leitura de coordenadas. Desmarcar e salvar apaga a região. Ocultar cartão impede seu uso; reexibir cartão mantém a preferência separada até revogação.
- Busca com CEP: consulta AwesomeAPI no servidor; Haversine em linha reta, sem rota/tempo de viagem. Não usa GPS. Anúncios online e CEPs sem coordenadas retornam distância nula, depois das distâncias conhecidas dentro do mesmo destaque/plano/pontos. Candidatos sem autorização continuam nos resultados, sem valor de distância exibido.
- Sem cobrança de IA, modelos, mudança de plano, compra ou renovação.

## Limites operacionais e testes
Supabase RPCs novas SECURITY INVOKER e service_role-only. Tabelas de coordenadas e regiões têm RLS e nenhum grant de browser. Handler valida token no Auth e vínculo ativo em cada pedido; estatísticas somente do principal verificado. IDs/coordenadas/turmas enviados pelo cliente não definem escopo ou origem. Candidato comum não consulta diretório de currículos.

CEPs de anúncios são obtidos por RPC apenas do conjunto público elegível do cohort, antes da paginação. Até 1.000 CEPs distintos por consulta; no máximo oito novos CEPs geocodificados por requisição, em lotes de quatro, timeout de cinco segundos cada. Cache de coordenadas de anúncios é válido por 30 dias; expirados ficam desconhecidos até atualização. Resposta explica cobertura incompleta; não inventa coordenadas nem usa diferença numérica de CEP como distância. Cache não associa CEP de origem a usuário. Não há background job nem cobrança ao provedor configurada.

Limite transacional compartilhado de 30 consultas por conta/hora para origem e atualização de região. A busca sem CEP permanece disponível após o limite. Falha ao localizar origem preserva dados e solicita buscar sem CEP; não declara distância calculada. Falha do painel opcional de médias/região não bloqueia o currículo ou gestão da organização. Filtros com CEP são limpos quando muda a sessão.

Fonte de geocodificação: AwesomeAPI, endpoint fixo HTTPS, sem URLs do cliente, sem redirects. Validação de CEP idêntico e coordenadas finitas dentro do território brasileiro. Consulta real de CEP público 13025000 retornou Campinas, -22.8964726/-47.0532716. BrasilAPI respondeu 403 neste ambiente e não foi adotada. Nenhuma chave foi criada ou alterada.

Migrações de produção: 20261022113328_organization_professional_team_averages e 20261022113333_optional_postal_distance_and_coarse_candidate_regions. Migrações anteriores permanecem históricas. Exceção já autorizada de demonstração exige cartão/anúncio e vínculo marcados fictícios; não desbloqueia login.

Suíte geral: 254 aprovados, zero falhas, um PDF privado ausente ignorado. Após ajustes de tolerância a falhas e filtros de sessão: 29 focados aprovados e build aprovado. Ensaio SQL hospedado com identidades sintéticas, médias/deduplicação, projeção de regiões e prioridade pago/destaque passou com rollback. Nenhum crédito/pagamento real modificado. Teste visual autenticado no navegador do titular ainda pendente.

## Privacidade e acesso
Finalidades: ordenação solicitada, transparência da equipe e proximidade opcional. Hipóteses de trabalho: execução do serviço solicitado para busca (art. 7, V); consentimento específico e revogável para região adicional (art. 7, I). Revisão técnica não certifica conformidade jurídica integral.

Dados mínimos: profissionais já publicados e comprovados, vínculos aceitos; origem digitada apenas para a consulta, área arredondada quando autorizada. Não usar CEP/endereço do currículo, CPF, salário, GPS, dados sensíveis ou histórico espiritual. AwesomeAPI recebe o CEP consultado e conexão do servidor, conforme aviso antes da ação; não enviamos identidade, currículo ou token. O descarte no portal não significa controlar a retenção do provedor externo.

Transparência: método, ausência de dados, publicação do cartão e autorização geográfica são explicados em tela. Não retornar plano interno, ledger, coordenadas ou distância numérica de candidatos. Médias agregadas podem permitir inferência quando há poucos membros; somente pontos profissionais de cartões públicos participam, sem demonstrativos individuais adicionais. Uma região autorizada pode ser inferida aproximadamente pela ordem das buscas; o arredondamento limita precisão e a opção inicia desligada.

Retenção/direitos: origem não persistida no perfil, CEP de autorização não armazenado; região até revogação ou exclusão da conta/cohort (cascade); cache apenas de CEPs públicos sem ligação ao pesquisador. Limites guardam ID e contador, sem CEP, com limpeza após 30 dias de inatividade na próxima operação e cascade ao excluir conta. Formação, cartão e vínculos mantêm correção/remoção existentes; excluir região não altera currículo ou cartão.

Fontes oficiais revistas em 22/10/2026:
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
- https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte
- https://docs.awesomeapi.com.br/api-cep
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/changelog.md
