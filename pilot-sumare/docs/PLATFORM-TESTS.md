# Operações reais — atualização de 16/10/2026

No domínio oficial, `/` é a página inicial pública; `/conta.html` contém autenticação Supabase e os espaços privados. O laboratório em `/laboratorio/` permanece uma demonstração separada.

## Implementado nesta atualização

- Empresa: dados da organização, publicação de vagas/cursos/treinamentos com CEP obrigatório, encerramento, recebimento de participações e resposta ao candidato.
- Instituição: dados da organização, cursos com certificado e treinamentos sem certificado, interesses e respostas. A publicação informa a categoria; não emite certificados nem efetiva matrícula.
- Candidato: busca por título/tipo, detalhes, candidatura com consentimento para compartilhar uma cópia do currículo, interesse em curso, acompanhamento e cancelamento.
- Compartilhamento do link de cada anúncio. Visitante precisa entrar e ter acesso ativo para abrir os detalhes.
- Avisos privados de novas participações, respostas e cancelamentos; sino com contagem e marcação de leitura.
- Proprietário: indicadores e gráficos por dia, semana, mês, trimestre, semestre e ano; avisos segmentados por perfil/cidade/UF/região; prévia dos destinatários antes de enviar.
- Ativação individual de contas de teste pelo proprietário, usando o tipo documental do banco. Exige e-mail confirmado e CPF/CNPJ concluído. Não abre a turma nem reativa contas suspensas.
- Seleção persistida de plano/pacote para cada perfil, com preços aprovados e descontos dos ciclos existentes. A escolha não gera cobrança ou benefícios.

## Verificação

46 testes locais aprovados, incluindo fluxos da interface, API administrativa, validação, PostgreSQL e isolamento de acesso. `tests/hosted-portal-operations.sql` passou no banco real com transação revertida: não restaram usuários/anúncios fictícios nem houve envio de e-mails. Advisors sem novos avisos de banco; há um aviso preexistente sobre proteção contra senhas vazadas no Auth.

## Roteiro de teste pessoal

1. Entrar com a conta proprietária no domínio. Abrir Painel do proprietário.
2. Cadastrar outras contas com e-mails próprios, confirmar e concluir o CPF/CNPJ; usar tipos diferentes. Na conta de dono, ativar cada e-mail em Acesso de contas para testes.
3. Na empresa, salvar organização e publicar vaga. No candidato, preencher currículo, buscar a vaga e enviar candidatura. Na empresa, conferir o currículo recebido e responder. No candidato, conferir aviso e resposta.
4. Na instituição, publicar curso. No candidato, registrar interesse e acompanhar a resposta. Conferir que a escola recebe somente nome e mensagem, sem currículo completo.
5. Testar avisos segmentados e mudanças de conta. Repetir em outro aparelho para conferir persistência.

## Ainda não concluído

- Login pessoal e experiência visual em navegadores/aparelhos reais ainda precisam de ensaio. Verificações automatizadas de DOM não equivalem a esse ensaio.
- Cobrança real Asaas, webhooks de produção, ativação/revogação de benefícios e conciliação financeira. Sandbox continua restrito ao responsável e separado da receita; indicador real é zero.
- Equipes e subusuários, agenda de entrevistas e videochamada, ranking/avaliações, anexos privados, parser de currículo e assistentes de IA integrados aos novos fluxos.
- Impulsionamento, ordem por plano/pontuação/distância, identidade oculta da vaga e ciclo completo de carreira continuam fora destas operações reais.
- Sorteios e abertura da turma permanecem desativados. A interface demonstrativa não certifica implementação desses módulos.

## Página inicial pública

O domínio abre vagas, cursos/treinamentos e cartões de candidatos, com navegação e Entrar/Cadastrar. Apenas anúncios publicados e campos de apresentação são públicos. Cartões de candidatos exigem autorização na área privada e ficam ocultos quando o vínculo deixa de estar ativo. CPF, e-mail e currículo completo não fazem parte da página pública.

O proprietário é encaminhado ao painel ao entrar em sua conta. Outros usuários recebem apenas seu espaço; nem o botão nem a API administrativa são liberados para eles. A página inicial não depende de sessão e não redireciona visitantes ao login.
