# Formação, upload e acessos: implementação e roteiro

Atualização de 17/10/2026 (Brasília). Produção: https://www.oempregadoronline.com.br .

## O que foi integrado

1. Currículo: upload PDF/DOCX, leitura por colunas e OCR local português para imagem; prévia editável e seleção por campo; preservar preenchimento existente; anexo privado salvo apenas ao salvar o currículo. Limites: 5 MB, 20 páginas PDF, até 5 páginas escaneadas. CAI/aprendizagem industrial em Cursos e treinamentos, técnico de nível médio em Formação; SENAI automático/manual, situação editável e consentimento do cartão público. Nenhum ponto é concedido só por marcar SENAI.
2. Formação e pontuação: comprovação privada em PDF/JPG/PNG, edição/exclusão por candidato, proprietário valida/rejeita com justificativa. Pontos calculados no banco conforme LEARNING_SCORE_PLAN.md: bases 1200/800/400/300/200, curso 1/h, treinamento 2/h, bônus recente +20%, indicação autorizada +25% para cursos/treinamentos. Edição invalida a aprovação. Desenvolvimento pessoal/intelectual/espiritual fica privado, fora da busca de emprego. Classificação profissional por pontos entre cartões com consentimento; seleção por competências específicas ainda deve ser ampliada conforme inventário.
3. Subusuários: principal convida uma conta já cadastrada e confirmada; destinatário aceita/recusa; principal revoga e reconvida para alterar permissões. Quatro permissões: editar perfil, publicar, buscar candidatos, gerenciar avaliação/ranking. Cada ação é validada no servidor. Aceitar não promove a conta a dono nem muda seu cadastro pessoal. Financeiro e gestão de acessos ficam com o principal. Compras reais/créditos/IA e reautenticação financeira continuam desativados.
4. Avaliação/ranking: critérios comuns por vaga, congelados após primeira avaliação; só avaliar entrevista confirmada cujo horário terminou; uma nota 0–10 por critério, evidências internas e média calculada no banco. Empates compartilham a posição. Pessoas sem avaliação ficam fora. Candidato não recebe notas/observações; participante de um processo não acessa suas avaliações pela permissão delegada.

## Testes executados

- 76 testes locais passaram, incluindo o PDF privado fornecido, permissões de arquivos, comprovantes, validação/retirada de pontos, áreas privadas, convite/aceite/revogação, delegação, critérios, avaliação, sigilo, empates e regressões existentes.
- Leitores reais: PDF e DOCX, duas disposições de colunas, PDF escaneado → OCR local em português → identificação SENAI; rejeição de assinatura/formato/tamanho inválidos. Sem chamadas de IA ou envio do conteúdo ao leitor externo.
- Ensaio no Supabase hospedado (`tests/hosted-talent-features.sql`): filtro SENAI, zero pontos sem comprovação, convite/aceite de subusuário fictício, avaliação delegada de entrevista sintética passada, média 9, bloqueio após revogação e bloqueio de notas para candidato. Tudo revertido ao final.
- O PDF real não entrou no banco, bucket, código-fonte ou cartões fictícios. Só foram registradas conclusões do teste, sem dados pessoais no relatório.
- Bucket privado, sem políticas anteriores abrangentes, 5 MB por arquivo. Currículo original: somente titular; comprovante: titular/proprietário. URL de leitura assinada por 60 segundos. Rubricas/avaliações sem acesso direto: somente funções com autorização.
- Não foi realizado login de teste no navegador/celular nem um upload/recuperação pela sessão real do proprietário. O roteiro abaixo completa essa verificação de uso.

## Roteiro para Sylvio

### Conta candidata

1. Entre na sua conta de candidato → Meu currículo → selecione PDF ou DOCX → Preencher pelo upload.
2. Confira Experiência, Competências, Formação, Cursos/Treinamentos e SENAI. Se houver texto preenchido, marque os campos que deseja substituir.
3. Aplique os campos selecionados → Salvar currículo no banco. Abra novamente a área e baixe o anexo salvo. Confira no celular também.
4. No cartão público, marque visibilidade e SENAI somente se desejar divulgar essas informações.
5. Minha formação e pontos → cadastre uma conclusão com comprovante. Antes da aprovação, a pontuação fica pendente.

### Conta proprietária

1. Analisar comprovantes → abrir comprovante privado → conferir nome, instituição, título, data e horas.
2. Validar ou não validar, com justificativa. Marcar indicação do portal somente quando houver indicação efetiva; não é uma opção do candidato.
3. Na conta candidata, conferir o aviso e os pontos. Editar a formação deve retirar a aprovação e exigir nova análise.

### Empresa/instituição e conta convidada

1. Acessos e permissões → informar o e-mail de outra conta própria já cadastrada e confirmada → selecionar permissões → enviar convite.
2. Na conta convidada, abrir Acessos e permissões e aceitar. Depois, abrir o espaço autorizado e testar só as ações concedidas.
3. Revogar na conta principal e tentar novamente na convidada: o servidor deve negar imediatamente.
4. Para mudar permissões, reenviar convite; o acesso volta a ficar pendente de novo aceite.

### Avaliação

1. Empresa → Avaliação e ranking → escolher vaga → definir critérios antes da primeira avaliação.
2. Após uma entrevista confirmada e encerrada, preencher uma nota por critério e evidências. Não há botão para fingir que uma entrevista real aconteceu.
3. Conferir média/ranking e tentar alterar critérios após a primeira avaliação: deve ser bloqueado. Verificar que o candidato não recebe notas internas.

Nenhuma senha, chave ou cópia de documento precisa ser enviada pelo chat. Os testes podem começar com arquivos fictícios. O upload real de um currículo só deve ser feito na conta do titular autorizado.
