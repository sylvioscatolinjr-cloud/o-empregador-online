# Revisão da instituição de ensino — 30/10/2026

## Conferência autenticada

Perfil Instituição de Ensino confirmado. Dados de organização (nome/cidade/UF) estavam vazios, sem publicações e sem interesses; não foram inferidos, preenchidos ou publicados anúncios reais. Há departamento e vínculo aceito existentes, preservados. Menu principal oferece somente Curso com certificado/Treinamento, valida campos obrigatórios e oculta vínculo de emprego. Busca por impressão3D retornou cartões fictícios compatíveis, sem currículo privado. Equipes, acessos, avisos e afiliados carregaram.

Planos mostraram perfil educacional e preços99,90/299,90/699,90/999,90. Treinamentos mostraram perfil correto, nível0, 1de13 conteúdos liberados e níveis1–4 bloqueados. Destaque bloqueado sem curso publicado, com orientação. Agente de Evolução Educacional mostrou22recursos e pesquisa Premium de captação (padrão2,50/ampliada5,00). Saldo0: nenhuma geração paga ou compra realizada. Turbinar e carteira conferidos como recursos do perfil, sem campanha, convite ou envio real.

## Correções

- O atalho do responsável em Abrir minha organização apresentava formulário alternativo com vaga de emprego e avaliação/ranking à instituição. Agora perfil, publicação e busca do responsável reutilizam os fluxos principais, que já respeitam school_staff e oferecem curso/treinamento. Instituição não recebe atalho de ranking nem permissão de recrutamento nos novos convites. Empresa mantém avaliação/ranking. Permissões previamente registradas não são reescritas.
- Delegados aceitos continuam usando comandos com ID da organização, permissões e verificação no servidor; não são redirecionados às ações pessoais do responsável. O servidor já bloqueava vaga para school_staff; não houve ampliação de acesso, grants ou mudança de banco.
- Busca usa o título potenciais alunos, sem afirmar matrícula ou vínculo escolar. Interesses recebidos têm contexto de curso, mensagem inicial e resposta ao interessado; entrevista de emprego só aparece para vaga.
- Menu identifica a área ativa nas telas de interesses e busca. A primeira configuração explica que os dados da instituição ainda precisam ser salvos; não preenche localização por suposição.
- Aviso legado de vínculo traduz o estado registrado accepted e outros códigos conhecidos; mensagens comuns e registros do banco permanecem como foram enviados.

## Dados e limites

Finalidade: funcionamento dos serviços educacionais solicitados, usando dados mínimos já existentes, com execução do serviço a pedido do titular (art.7º,V LGPD) e consentimentos específicos preservados quando aplicáveis. Nenhuma nova coleta, fornecedor, retenção ou exposição de currículo. Operações de equipe continuam exigindo finalidade do CPF e aceite; acesso delegado continua exigindo convite aceito e permissão no servidor. Não há envio de dados pessoais a modelos na conferência. Direitos, canal de atendimento, retirada de consentimentos e regras atuais permanecem. Consulta de princípios da LGPD e orientação oficial ANPD: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/glossario-anpd/p e lei compilada https://normas.leg.br/?urn=urn:lex:br:federal:lei:2018-08-14;13709 . Não constitui certificação jurídica integral.

## Validação

Testes de UI dos perfis instituição/empresa/delegado, publicação canônica, convites, tipo curso, contexto dos interesses, avisos antigos e regressão da suíte completa. Build e prévia antes do merge, seguida de conferência autenticada na produção. Prévia sem banco não comprova integração autenticada. Testes sintéticos de banco validam proteções existentes sem publicar cursos, enviar convites, alterar vínculos ou cobrar nesta conta real. Pagamento e geração paga na instituição ficam sem execução real por ausência de saldo.
