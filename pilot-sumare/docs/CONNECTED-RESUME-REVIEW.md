# Revisão conectada do currículo e padrão do menu — 21/10/2026

Pedido de Sylvio: usar currículo e anexo já salvos, comparar melhorias e salvar somente escolhas do candidato; novos controles devem seguir o padrão dos vizinhos.

## Fluxo implementado

Tarefa Revisar meu currículo carrega dados próprios autenticados em /api/ai?action=resume-source. Servidor confirma e-mail, candidato ativo não fictício e identidade por bearer; não aceita user_id do navegador. Lê somente perfil dessa conta e anexo cujo caminho pertence a user/cohort/resume, com URL de 60 segundos. Documento PDF/DOCX é lido localmente pelo mesmo leitor/OCR do currículo (até 5 MB, 20 páginas/5 OCR); texto extraído até 70 mil caracteres. Não há necessidade de copiar ou reenviar o arquivo. Falha na leitura do anexo bloqueia análise e informa correção do arquivo.

UI mostra campos, texto extraído, destino OpenAI e preço de R$1 antes de confirmação explícita. Server recarrega perfil, confere versão e plano elegível, ignora perfil informado pelo cliente e envia campos profissionais/texto do anexo (máximo total 90 mil caracteres) com omissão de nome/contatos reconhecidos. Não envia foto/arquivo binário, CPF/CNPJ cadastral ou campos pessoais estruturados. Redação livre/anexo podem conter dados sensíveis não reconhecidos; omissão não garante anonimização. A pessoa deve revisar as fontes antes de autorizar envio.

Responses API existente, modelo definido no ambiente, store:false e JSON schema estrito. Sem migração de provedor/SDK/modelo. Propostas limitadas a redação profissional; datas, cargos, diplomas e demais fatos estruturados não são alvos de edição. Prompt trata fontes como dados não confiáveis e orienta não inventar fatos. Isso não garante veracidade do modelo: revisão humana continua necessária. Anexo pode estar antigo; divergências são relatadas, não incorporadas automaticamente.

Até 12 sugestões: original/sugerido/justificativa, aceitação individual desmarcada inicialmente. Analisar não altera perfil. Manter original não grava. Salvar envia somente targets escolhidos e proposta assinada, vinculada à conta e à versão por 30 minutos. Alteração na proposta, outra conta ou expiração é rejeitada. Nova análise cobra uma nova execução; selecionar/salvar sugestões não cobra. Falha do provedor ou saída inválida tenta estorno pelo ledger existente; falha de estorno é indicada para verificação.

Função SECURITY INVOKER portal_ai_apply_resume exclusivamente service_role compara snapshot inteiro sob bloqueio de linha e aplica apenas campos permitidos; conflito não sobrescreve outra edição. Função não permite alteração de identidade, caminho de anexo ou foto. Dados não selecionados e opções de compartilhamento preservados. Script db/ai-resume-review.sql aplicado somente na homologação xxirjbsbfxwzplrcbbjt; precisa integrar ao processo de migração antes de promover para produção. Propostas em memória, sem novo histórico persistente; recarregar perde a proposta. Anexo original não é reescrito.

Menu: CSS compartilhado de button e links da space-nav, incluindo medidas, tipografia, fundo, bordas, hover e estado ativo; Meus agentes continua link semântico. Regra permanente incluída em AGENTS.md.

## Evidência e limites

171 testes locais aprovados, zero falhas/ignorados (PDF pessoal autorizado somente local). Build aprovado. Novos testes cobrem seleção/consentimento, escape de HTML, duplicação, campo profissional permitido, preservação de dados, assinatura/expiração/conta, fontes antigas e estorno em falha. Ensaio PostgreSQL hospedado com usuário fictício BEGIN/ROLLBACK confirmou aplicação seletiva, conflito com snapshot antigo, contatos/competências preservados e negação ao cliente. Consulta posterior: zero fixtures restantes, authenticated sem EXECUTE, service_role com EXECUTE. Advisor: nenhum aviso ligado à nova função; avisos anteriores de RLS sem políticas em tabelas de servidor e proteção de senhas vazadas desabilitada continuam fora desta alteração. Remediação do aviso de Auth: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . Não criar políticas para tabelas privadas apenas para eliminar aviso informativo.

Navegador autenticado continua bloqueado pelo runtime após entrega nativa de credenciais. Não contornar com tokens/cookies/automação alternativa. Teste visual completo e chamada real do novo fluxo pela interface ainda dependem de validação; testes de provedor usam resposta sintética. Nenhum currículo pessoal foi enviado à OpenAI nesta implementação e nenhum pagamento real foi criado. Não declarar homologação comercial completa.

## Privacidade e referências

Finalidade: revisão profissional solicitada pelo titular, hipótese contratual aplicável art.7,V sujeita à avaliação do controlador; não cobre tratamento irrestrito de dados de terceiros ou sensíveis. Minimização, transparência antes de enviar, acesso próprio, escolha por sugestão e conservação do anexo/flags. Dados da proposta apenas em memória por até 30min; contabilidade mantém ledger existente. store:false não significa retenção zero do provedor. Antes de abertura comercial continuam necessárias política de retenção/direitos, base para casos sensíveis e transferência internacional. Não há certificação jurídica.

Consultados: LGPD arts.6/7/9/18/46 https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm ; ANPD IA generativa https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos/radar_tecnologico_ia_generativa_anpd.pdf ; OpenAI https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses ; Supabase funções/privilégios e changelog já consultados nesta sessão. Produção preservada.
