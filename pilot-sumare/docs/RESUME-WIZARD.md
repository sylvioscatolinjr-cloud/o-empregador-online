# Currículo guiado, foto e logo — 18/10/2026

Referências: quatro prints fornecidos nesta conversa (contato, edição de foto, histórico e navegação). A URL externa indicada não abriu pela consulta; nenhuma sessão ou dado daquela plataforma foi acessado. Implementação própria preserva cores e navegação do O Empregador Online.

## Fluxo e compatibilidade

Sete etapas: contato; histórico profissional; formação acadêmica; cursos/certificados; competências; objetivo; revisão. Voltar/Próximo e navegação direta mantêm o rascunho na memória da tela. Salvar currículo grava explicitamente no banco; sair da tela sem salvar descarta a edição. A etapa final abre a impressão do currículo salvo. Prévia em duas colunas, impressão/Salvar PDF pelo navegador, adaptação em telas pequenas.

Contato: nome/sobrenome, cidade/UF, telefone/e-mail opcionais. Em seção adicional opcional: endereço, CEP, nascimento, estado civil, nacionalidade e categoria CNH (sem número do documento). Experiências: cargo, empregador, local, início/término mês/ano, atual, atividades/resultados. Formação/cursos: título, instituição, nível ou horas, local, período, andamento e descrição. Até 30 registros por seção. Campos livres e ajuda preservados. Formação SENAI continua declarada, sem pontos/validação automática por preencher currículo.

Texto antigo fica na seção correspondente, sem migração destrutiva nem classificação inventada. Registros estruturados novos são combinados com esse texto para candidatura e impressão. Ao recarregar, o texto de origem é mantido separado para não duplicar os registros. Usuário pode mover trechos para os novos campos, removendo conscientemente duplicatas. Upload PDF/DOCX/OCR local permanece revisável; campos só substituídos quando selecionados. Nome separado na importação, contato/local/CEP mapeados quando encontrados; histórico/formação/cursos entram em texto revisável, sem adivinhar datas e empregadores. Registros estruturados existentes preservados.

## Imagens

Foto/logo opcionais: JPEG, PNG, WebP até 5 MB; renderização local em canvas 360×360, rotação, espelhamento, zoom, posição, filtros e remoção. Normalização raster remove metadados e exporta WebP compacto. Até 180.000 caracteres de data URI no banco (aproximadamente 130 KB binários); nenhuma URL remota ou SVG aceito. Logo começa com encaixe integral; foto com preenchimento do recorte. Formato da foto: circular, quadrado, arredondado ou retrato, na prévia/impressão.

Foto compacta usa a linha privada do perfil e suas políticas existentes. Logo usa organização; triggers replicam para anúncios da organização e sincronizam substituição/remoção. Anexos de currículo continuam no bucket privado existente. Imagens desta conversa não foram carregadas nas contas reais.

## Privacidade

LGPD consultada no texto oficial compilado: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm . Arts. 6, 7, 8, 9, 18 e 46: finalidade, necessidade, informação, escolha específica e segurança. Dados/foto são opcionais, sem reconhecimento facial, biometria, inferência, ranking ou filtro discriminatório. Foto e contato não vão para a vitrine pública. Flags separadas para contato, informações adicionais e foto controlam inclusão na impressão e em novas candidaturas; por padrão desligadas. A candidatura ainda exige confirmação de compartilhamento.

Trigger no servidor acrescenta somente dados selecionados ao snapshot da vaga; interesse em curso mantém o comportamento anterior de nome/mensagem. Empresa nunca ganha SELECT do perfil privado. Dados enviados anteriormente não mudam retroativamente com edição do currículo, informação explícita no formulário. Foto e dados podem ser removidos do perfil; logo removido sincroniza anúncios atuais. Política geral de retenção, atendimento a direitos sobre cópias enviadas e governança permanece no inventário; esta entrega não certifica conformidade integral.

## Testes e limites

Testes DOM: etapas, adição/remoção, importação, persistência de modelo sem duplicação, menus e impressão. Teste de canvas com imagem sintética: transformação/exportação/remoção, sem rede. PostgreSQL local e transação revertida hospedada: campos privados, flags de compartilhamento, snapshots, logo/remoção e bloqueio de formatos ativos. Fonte/docs de Storage consultadas, sem novas permissões de bucket. Sem controle de navegador disponível: conferência visual e interação em aparelhos reais continuam a validar pelo usuário. Auditoria Supabase: sem novo alerta; permanecem avisos privados intencionais e proteção de senhas vazadas já documentada em TEAM-PRIVACY.md.
