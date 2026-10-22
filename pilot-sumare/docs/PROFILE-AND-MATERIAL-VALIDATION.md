# Validação de perfis e materiais — 22/10/2026 (Brasília)

## Correções
A leitura de nível pago para catálogo de agentes, chat, revisão de currículo e treinamentos agora exige a turma configurada do servidor. A consulta restringe usuário e turma; uma segunda checagem descarta pedidos de outro usuário, perfil ou turma antes de buscar pagamentos. São projetados apenas os campos necessários para a regra de preço, período e elegibilidade. Escolha visual, metadados ou turma enviada pelo cliente não liberam nível. Nenhuma mudança no preço, carteira ou reserva financeira.

O handler de treinamentos aguarda a rotina assíncrona de gerenciamento dentro de seu try/catch. Assim, falhas de banco/Storage recebem JSON controlado de indisponibilidade em vez de rejeição não tratada. Não é exibida mensagem de salvamento bem-sucedido após falha.

## Evidência técnica
279 testes gerais aprovados, zero falhas, um PDF privado ausente ignorado. 48 testes focados finais e build aprovados. Matriz de todas as tarefas nos níveis 0/1/2/3 usa modelo simulado; não representa avaliação qualitativa de 54 respostas reais. Novo caso impede compra de outra turma liberar chat ou provocar débito nos três perfis. Treinamentos e materiais também recusam plano de outra turma.

Ensaios de PDF/PPTX usam Storage simulado e conferem público, nível e senha antes de gerar download de 60 segundos; sem expor caminho interno. Links HTTPS, publicação, prévia administrativa, senha adicional e rejeição de arquivo inválido permanecem cobertos. Nenhum arquivo foi enviado ao Storage real nesta rodada. Não foram invocados OpenAI/Asaas nem enviados avisos reais. Sem migração ou mudança de conta/plano.

## Situação real verificada por leitura mínima
As contas Empresa contato@oktabrasil.com.br e Instituição sylvio@supermaker.com.br estão confirmadas, ativas, nos papéis esperados, sem bloqueio e sem plano pago vigente na turma de produção. Portanto execução de IA paga nesses perfis continua pendente; não conceder plano/crédito fictício nem criar compra para marcar teste.

O catálogo adicional portal_oeo_learning ainda não tem materiais nesta turma. Os 27 treinamentos originais continuam disponíveis conforme nível; não confundir ausência de uploads adicionais com ausência desse catálogo. Primeiro upload/acesso real depende de material próprio/autorizado enviado pelo proprietário. Roteiro sem compra: no login do proprietário, abrir Cursos & Treinamentos OEO → Gerenciar conteúdos → cadastrar PDF/PPTX ou HTTPS, nível Grátis e os públicos desejados → publicar → pré-visualizar; depois abrir o card nas contas de cada público e conferir acesso. Senha adicional, quando definida, deve ser testada com senha incorreta e correta. A prévia administrativa não comprova acesso comum.

Titular confirmou nesta conversa que a conferência visual no celular ficou OK após a última publicação. Leitor de tela real permanece pendente. Isso não substitui aceite de arquivos/treinamentos ou geração real de respostas nos perfis Empresa/Instituição.

## Privacidade
Finalidade: verificar prestação do serviço solicitado e corrigir autorização e tratamento de falhas, com execução contratual como hipótese de trabalho. Leitura real limitada a status de contas explicitamente informadas, papel, confirmação/bloqueio, nível e contagem agregada de materiais; sem senhas, tokens, sessões ou conteúdo privado. Fixtures usam dados sintéticos; nenhum currículo de terceiros é enviado a modelo. Consulta de pagamentos passa a ser mais restrita; acesso, retenção e direitos existentes preservados. Sem nova tabela/armazenamento/compartilhamento. Riscos de concessão indevida entre turmas e erro silencioso mitigados por filtro no banco, checagem defensiva e resposta controlada. Não constitui certificação jurídica integral.

Fontes oficiais revistas: LGPD https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm ; ANPD https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-vf.pdf ; Supabase https://supabase.com/docs/guides/database/postgres/row-level-security .
