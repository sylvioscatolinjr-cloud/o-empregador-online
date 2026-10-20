# Importação de currículo — protótipo privado

Acesso: Meu Espaço → Candidato → Meu currículo. O upload aparece antes dos campos. Aceita PDF e Word DOCX até 5 MB; a opção manual mantém o arquivo selecionado como anexo ao salvar.

A importação extrai texto com PDF.js ou Mammoth. Páginas escaneadas passam por OCR em português com Tesseract no próprio aparelho. Nenhuma API de modelos ou crédito de IA é usado. Os leitores e o idioma são servidos pelo próprio portal, carregados somente quando necessários. Limites: 20 páginas de PDF, até 5 escaneadas, 200 mil caracteres, 30 MB de conteúdo DOCX descompactado. Arquivos incompatíveis, com senha ou leitura insuficiente permitem preencher manualmente.

Antes de preencher, o candidato revisa os campos encontrados. Campos existentes com valor diferente só são substituídos quando selecionados. Não há salvamento automático do resultado importado; o usuário confirma com Salvar. OCR pode confundir caracteres, sobretudo e-mail, telefone e datas; a revisão é necessária.

A marcação SENAI é uma declaração editável do candidato. A análise identifica menções na formação e sugere Concluído, Cursando ou A confirmar; não verifica certificados ou vínculo institucional. SENAC e SENAI citado somente como empregador não ativam a indicação. Havendo vários cursos SENAI, pelo menos um concluído gera a situação Concluído. O recrutador tem filtros por formação SENAI e situação. Essa marcação não altera pontuação ou ranking.

No ambiente demonstrativo atual, perfis são fictícios e os bytes do anexo ficam no IndexedDB do navegador (somente na sessão se IndexedDB não existir). O arquivo é preservado e baixável pelo perfil candidato e pelo recrutador da simulação quando o currículo está visível ou se candidatou a uma vaga daquela organização. Outros candidatos fictícios não recebem um link para o arquivo de outra pessoa. Reiniciar exemplos também remove o anexo. Isso demonstra a experiência entre papéis no mesmo espaço; compartilhamento entre contas/aparelhos exige a implantação do backend multiusuário do piloto, com armazenamento e autorização por candidatura. O portal continua com acesso privado ao proprietário.

## Verificação

- `node tests/resume-parser.cjs`: campos, SENAI/SENAC, situação, negação, empregador e ausência de dados inventados.
- `node tests/resume-extractors.mjs`: arquivos PDF/DOCX reais de teste, PDF escaneado com OCR português real, formatos inválidos e tamanho.
- `node tests/resume-import.cjs`: fluxo de upload, revisão, preservação de campos, preenchimento manual, marcação/desmarcação SENAI, persistência, download com bytes idênticos, filtros do recrutador, candidaturas e reset.
- Regressão: testes existentes `private-demo.cjs`, `flows.cjs`, `carousel.cjs`, `portal-ui.cjs` e `server.mjs`; build e validação de ESM.

Os testes usam somente fixtures fictícias em tests/fixtures. Para repetir os testes de extração/integração neste ambiente: runtime Node 24 com @napi-rs/canvas e tesseract.js 7, dependências de teste mammoth 1.13.0 e fake-indexeddb 6.2.5 (diretório configurável em RESUME_TEST_DEPENDENCIES), além de linkedom para os testes DOM. O navegador não estava disponível para revisão visual nesta execução; os testes DOM não substituem essa revisão.

## Leitura e classificação aprimoradas

A extração PDF usa agora a posição dos fragmentos de texto na página, agrupando linhas, identificando um corredor consistente entre colunas e reconstruindo cada coluna de cima para baixo. A ordem dos objetos internos ou fontes do PDF não define mais a ordem de leitura. O OCR português também fornece caixas de palavras para a mesma reconstrução. Blocos carregam página e coluna para evitar que a seção de uma coluna absorva o conteúdo de outra; seções continuam na página seguinte.

Formação acadêmica e técnica, cursos e treinamentos e certificações têm campos próprios, ao lado de experiência e competências. Títulos em português e inglês, variantes de títulos e títulos seguidos de dois-pontos são reconhecidos. Registros com sinais claros de emprego ou formação não são colocados em competências por falta de título. Trechos sem classificação segura aparecem para revisão e não são importados como competências. Nenhuma informação ausente é inventada.

A revisão permite editar os textos de cada seção antes de aplicar e selecionar todos os campos encontrados quando o candidato deseja substituir uma importação anterior. Campos já preenchidos continuam preservados por padrão. Os novos campos persistem, aparecem na impressão do currículo e nos detalhes do currículo visível ao recrutador. Cadastros anteriores não são alterados automaticamente: é necessário importar de novo, revisar a substituição e salvar.

Validação adicional: `tests/resume-classification.cjs` cobre títulos, contexto, idiomas, conteúdo incerto e continuação; `tests/resume-extractors.mjs` inclui PDFs fictícios de duas colunas com a ordem interna deliberadamente diferente da visual e colunas laterais à esquerda/direita; `tests/resume-import.cjs` usa PDF real de teste até revisão, salvamento, impressão e detalhes para recrutadores. O arquivo pessoal enviado para reproduzir o problema foi lido e testado somente em arquivos temporários, sem ser incluído no código, fixtures, dados demonstrativos ou implantação. A revisão visual do portal em navegador continua indisponível nesta execução.

## Modalidade de cada formação

A importação separa cada registro de formação mesmo sob um título genérico como Formação. Escolaridade, graduação, pós-graduação e curso técnico de nível médio vão para Formação acadêmica e técnica. Aprendizagem industrial (CAI), qualificação, capacitação, cursos livres e extensão vão para Cursos e treinamentos. Certificações continuam no campo próprio. Instituição, unidade, período, situação e carga horária informada acompanham o respectivo registro. O assunto do curso, a instituição SENAI ou a carga horária isolada não determinam a modalidade. Uma aprendizagem expressamente técnica de nível médio permanece na formação técnica.

O SENAI-SP identifica [Eletricista de Manutenção Eletroeletrônica como Curso de Aprendizagem Industrial](https://www.sp.senai.br/curso/eletricista-de-manutencao-eletroeletronica/107779) e [distingue qualificação profissional/aprendizagem dos cursos técnicos](https://www.sp.senai.br/noticia/senai-sp-abre-mais-de-3100-vagas-em-cursos-gratuitos-de-formacao-profissional). Essa distinção orienta os campos do portal; não equivale à validação de diploma ou certificado. Informações do catálogo não são adicionadas ao currículo.

`node tests/resume-training-types.cjs` verifica a redistribuição por registro, CAI misturado com escolaridade e graduação, curso técnico no campo de cursos, extensão em universidade, preservação de unidade/carga horária/período, períodos numéricos que não devem ser confundidos com telefone, estado SENAI sem contaminação pela formação seguinte e ausência de mudança na experiência de instrutores.
