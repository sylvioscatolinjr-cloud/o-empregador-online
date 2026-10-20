# Departamentos, consentimento e indicador da equipe

Implementado no protótipo privado em Perfil da organização, para Empresa e Instituição de Ensino. A área Usuários e permissões continua separada: aceitar um vínculo de equipe não concede acesso administrativo.

## Caminhos de revisão

1. Meu Espaço → Empresa (ou Instituição de Ensino) → Perfil da organização → Adicionar departamento.
2. No departamento, Incluir membro → CPF fictício 000.000.000-01 a -04, ou CNPJ parceiro fictício 00.000.000/0003-03 para selecionar um membro de exemplo.
3. O convite aparece como Pendente de aceite. Como Candidato, abra Meus vínculos e selecione o candidato fictício em foco. O sino também leva ao convite. Aceite ou recuse. Somente esse candidato pode responder no modelo de teste.
4. Para pessoa sem cadastro, use CPF fictício -05 a -99 e e-mail @example.com. O convite fica Pendente de cadastro, com prévia do e-mail explicitamente não enviado. A prévia permite simular abertura, cadastro com documento/e-mail correspondentes, confirmação de e-mail e, em etapa separada, aceite ou recusa.
5. A organização pode cancelar o convite ou encerrar um vínculo confirmado. Cada alteração confirmada recalcula as médias e registra um retrato antes/depois.
6. Simular substituição compara o candidato com a média atual e com quem sairia, sem alterar a equipe. Convidar para substituir deixa o membro atual ativo até o novo candidato aceitar. O aceite encerra o vínculo anterior e inclui o novo na mesma alteração do modelo. Recusa, cancelamento ou vencimento preservam o membro atual. Se o vínculo anterior já tiver terminado, o aceite da substituição é bloqueado até um novo convite coerente.

Os documentos com prefixo zero são aliases reservados de demonstração, não identidades consultadas ou verificadas. Apenas a referência fictícia é persistida no novo módulo. Não use informações pessoais reais. O cadastro comum já exige CPF/e-mail para Candidato e CNPJ/e-mail para os demais perfis; o cadastro de teste iniciado por convite exige documento/e-mail e confirmação simulada correspondentes ao convite. A confirmação simulada não autentica uma conta real.

## Cálculo

A pontuação usada é o índice profissional existente, calculado com formações concluídas e pontuadas. Aprendizado espiritual privado fica fora. Os pontos não dependem da consulta atual de vagas, da assinatura ou das notas da entrevista. Os índices de Minha Qualidade continuam distintos.

Média da organização = soma dos pontos de todos os membros confirmados ÷ total de membros confirmados. Cada pessoa conta uma vez por organização. A média geral não é uma média simples das médias dos setores: setores com mais integrantes têm seu número correto de pessoas no denominador. Membros confirmados com zero pontos contam no denominador; pendentes, recusados, cancelados, expirados e vínculos encerrados não contam. Sem confirmados, a tela mostra —.

O indicador mostra organização e departamento antes/depois, diferença absoluta e percentual. Base anterior zero ou inexistente não produz percentual infinito. O histórico guarda as pontuações observadas na data de entrada, saída ou substituição; a média atual acompanha a evolução dos pontos profissionais dos integrantes. A tabela mostra as últimas 12 movimentações.

Exemplo que diferencia as duas comparações: equipe com 900, 300 e 0 tem média 400. Substituir 900 por 800 reduz a média para 366,67, embora o novo membro esteja acima dos 400 anteriores. Substituir o membro de zero por alguém com 200 aumenta a média para 466,67, embora o novo integrante fique abaixo da média anterior. A interface exibe esses fatos separadamente.

## Limites e preparação do piloto

A demonstração atual continua owner-private, com uma organização por perfil, diretório fictício e estados no navegador. Avisos de convite/aceite/recusa são direcionados ao perfil de teste e integrados ao sino. Não há contas compartilhadas reais, busca em base nacional de documentos ou entrega de e-mail. A consulta Supabase desta execução retornou zero projetos; as variáveis do Sites não incluem um serviço de e-mail. Nenhum projeto pago ou serviço externo foi criado e nenhum e-mail foi enviado.

Foram preparados no diretório do piloto, sem carregamento pela demonstração:

- `src/registration-identity.mjs`: política de documento/e-mail obrigatórios por perfil, validação de formato/dígitos, referência de busca por HMAC com segredo exclusivamente no servidor e verificação de convite vinculado ao documento e ao e-mail confirmado. Formato válido não comprova identidade ou representação.
- `src/invitation-delivery.mjs`: adaptador de envio por Resend, desativado sem configuração, origem HTTPS fixa, destinatário único, chave de idempotência e estados de falha/submissão. Documento completo não vai no e-mail. Submissão ao provedor não significa entrega.

A ativação real exige projeto dedicado, persistência/índices únicos e transações, autorização por conta/organização, cadastro documental obrigatório no servidor, RLS, pontuações obtidas da base confiável, tokens aleatórios com uso único, fila durável com trava por trabalho, remetente/domínio e provedor configurados. Os adaptadores precisam ser conectados à aplicação multiusuário; não basta fornecer uma chave de e-mail ao protótipo. O registro de entrega deve persistir o ID do provedor e impedir duplicação também após a janela de idempotência. O acesso dos convidados deve usar a futura URL do piloto, preservando a privacidade do Sites atual.

Referência do adaptador: https://resend.com/docs/api-reference/emails/send-email

## Validação

- `tests/organization-model.cjs`: isolamento, duplicidade, estados, expiração, cadastro/consentimento separados, médias com diferentes tamanhos de setor, zeros, simulação sem alteração, substituição atômica, histórico e percentuais.
- `tests/organization-ui.cjs`: tela real em DOM, empresa e instituição, buscas CPF/CNPJ, sinos direcionados, aceite/recusa, cadastro por convite com campos obrigatórios, identidade divergente, projeção, troca, encerramento, persistência e ausência de concessão administrativa ou rede real.
- `pilot-sumare/tests/invitation-delivery.test.mjs`: política de identidade e transporte com provedor controlado, sem envio externo.
- Regressão dos fluxos existentes, currículos e carrosséis; build/validação de artefato.

A revisão visual do portal em navegador não estava disponível; testes DOM e de serviço não substituem essa revisão.
