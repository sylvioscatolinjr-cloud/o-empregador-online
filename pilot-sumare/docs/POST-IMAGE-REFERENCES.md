# Logo e referência visual no assistente de posts — 23/10/2026

Pedido expresso: campos opcionais de logo e imagem de referência, seguidos da tarefa digitada, nos assistentes de posts da Empresa e Instituição. Sem remoção de outros recursos, aumento de preço ou mudança de perfil/plano. Mantidos R$1 por execução comum e quota exclusiva do proprietário sem débito. Pesquisa Premium permanece R$2,50 e não recebe imagens.

## Comportamento

- Dois uploads opcionais, prévia, remoção independente e campo obrigatório Descreva a tarefa para criar o post. Selecionar arquivos não executa ou cobra.
- PNG/JPEG/WebP de até5MB cada no navegador. Normalização para PNG por canvas preserva proporção/transparência, remove metadados do arquivo nessa operação e limita a1024px e512KB por imagem, reduzindo resolução se necessário. Limite de40MP no decode. Não recorta o logo ou a referência.
- Logo e referência são diferenciados no input multimodal Responses input_image; a tarefa permanece input_text. Modelo orienta texto, paleta, composição e posicionamento do logo. Conteúdo das imagens é dado não confiável, sem instruções privilegiadas, identificação de pessoas ou alegação de arte gerada. Entrega continua textual: legendas, ideias de carrossel, roteiro e orientação visual. Não gera arquivo de arte final nem publica/agende em rede social.
- Duas imagens no máximo, chaves fixas, consentimento obrigatório quando houver arquivo. Servidor aceita somente data URLs PNG normalizados, base64 canônico, tamanho/assinatura/IHDR/IEND e dimensões até1280px. Não faz fetch de URLs externas ou interpreta SVG. Validação de cabeçalho não é antivírus nem garantia de decodificação; erro do provedor devolve a reserva conforme rotina existente.
- Payload JSON até1,5MB para imagens e texto; limite textual independente de9KB conserva controles de contexto/pergunta. Demais tarefas rejeitam postImages, mantendo seus limites. Não muda a origem, Auth confirmado, papel do banco/turma, fictícios, consentimento ou rotina de débito/devolução.
- Upload/processamento concorrente bloqueia execução e troca de recurso, evita resposta antiga do preparo e não muda dimensões dos cards. Ao selecionar outro recurso, referências e autorização são limpas. Saída/troca de sessão remove a tela privada, mantendo checagens de identidade pré/pós API.

## Dados e direitos

Finalidade: analisar material visual fornecido voluntariamente para orientação de divulgação solicitada. Dados mínimos: logo/imagem reduzidos e tarefa; sem anexar automaticamente foto/cadastro/alunos, nomes de arquivos ou links externos. Transparência antes do envio: destino OpenAI, autorização de uso e envio, ausência de gravação do arquivo no histórico. Art.7,V (execução solicitada) é hipótese aplicável a avaliar; checkbox explicita a autorização operacional e não substitui análise de transferência internacional e direitos de imagem. Orientação para não enviar pessoas/dados de terceiros sem autorização, especialmente alunos/menores. Não usar legítimo interesse para coletar ou identificar pessoas.

Arquivos ficam apenas no estado transitório do navegador/requisição e são usados com store:false; não há bucket público, novo armazenamento, log de corpo ou persistência de base64 no banco/histórico. Salvamento explícito preserva apenas texto de tarefa/resposta, podendo conter descrição visual; mecanismo privado de exclusão e cascade existente permanece. store:false não garante retenção zero no provedor. Redução/remoção no navegador não impede envio direto de arquivo modificado à API; titular deve usar conteúdo autorizado, e servidor aplica formato/tamanho/consentimento. Atendimento/direitos: master.sylvio@oempregadoronline.com.br. Revisão técnica não equivale a certificação jurídica.

Histórico disponível e fontes oficiais revistos:
- LGPD arts.6,7,18,33,46: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
- ANPD: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_hipoteses_legais_tratamento_de_dados_pessoais_legitimo_interesse
- OpenAI imagem/base64 Responses: https://developers.openai.com/api/docs/guides/images-vision

## Validação e reversão

Testes de normalização/proporção e fechamento de bitmap, payload multimodal efetivo para os dois perfis, ausência de imagens na resposta/histórico, consentimento, arquivos inválidos/URLs/chaves desconhecidas, preço1, rejeição antes de cobrança, devolução, prévia/remoção, preparo antigo descartado, tela de posts e regressão de seleção/Premium. 21 testes focados finais aprovados e build aprovado. Suíte completa e publicação registradas no contrato de continuidade. Provedor simulado nestes testes; não alegar verificação real de um logo privado ou aceite visual no aparelho. Sem nova migração, conta, mensagem, compra ou débito real de usuário. Reversão apenas de frontend/handler/módulo, sem necessidade de reverter banco ou carteira.
