# Ensaio de comunicação e integração do protótipo

Execução no Supabase hospedado em 18/10/2026 UTC (17/10/2026, Brasília). Aplicação: https://www.oempregadoronline.com.br .

## Implementado nesta entrega

- Favoritos privados de vagas, cursos e treinamentos; estrela atualiza sem reconstruir a vitrine e a lista persiste por conta.
- Minha Carreira: vínculos e admissão/saída, promoções/mudanças/reajustes, remuneração e responsabilidade, séries em tabela e indicadores gráficos, edição e exclusão confirmada. Histórico separado do currículo compartilhado.
- Departamentos para empresa e instituição; convite a candidato com cartão público, aceite/recusa pelo destinatário, cancelamento/encerramento pelo remetente e avisos internos. Aceite não concede acesso administrativo.
- Etapas por candidatura: nome, data/horário de Brasília, conclusão e reversão; candidato acompanha suas etapas e recebe avisos.
- Painel do proprietário com contagens dos registros fictícios, separado das métricas de usuários reais.

## Resultado observado no banco hospedado

| Item | Quantidade |
|---|---:|
| Candidatos fictícios | 50 |
| Empresas fictícias | 50 |
| Instituições fictícias | 50 |
| Candidaturas a vagas | 50 |
| Interesses em cursos, respondidos pela instituição | 50 |
| Entrevistas confirmadas pelo candidato | 40 |
| Horários recusados pelo candidato | 10 |
| Vínculos de equipe aceitos | 40 |
| Convites de equipe recusados | 10 |
| Etapas concluídas (após concluir, reabrir e concluir) | 50 |
| Históricos de carreira privados | 50 |
| Favoritos privados | 50 |
| Avisos internos gerados | 600 |
| Contas de demonstração com login bloqueado e sem senha | 150 |

## Como foi verificado

`tests/demo-communication-seed.sql` opera apenas entre membros e anúncios marcados como fictícios. Alterna explicitamente a identidade de cada ator e a role `authenticated` no PostgreSQL, usa as mesmas funções públicas e políticas RLS da aplicação e grava o resultado no banco real. Não usa a chave de serviço para ignorar as políticas nos passos do candidato/organização. Leitura de fixtures e seleção inicial são administrativas; cada operação de negócio ocorre sob a identidade correspondente. A transação aborta se o ator não recebe a resposta esperada, se o convite não foi respondido ou se a empresa consegue ler carreira/favoritos privados.

O teste local também executa o roteiro duas vezes e confirma 100 participações, 40 entrevistas confirmadas e 40 vínculos aceitos, sem duplicar as linhas de negócio. Testes específicos verificam bloqueio de terceiros/anônimos, proibição de aceite pelo remetente, falta de permissão de administração para convidados e conclusão/reversão de etapas. A suíte final contém 71 testes aprovados, incluindo regressões de cadastro, logout, carrosséis, PWA, blog, cobrança sandbox e entrevistas.

## Caminhos para testar com contas reais próprias

- Candidato: Meu espaço → Minha Carreira; Favoritos; Meus vínculos; Minhas participações → Etapas do processo.
- Empresa: Área da empresa → Participações recebidas → Etapas do processo; Departamentos e equipe.
- Instituição: Área da instituição → Departamentos e equipe; publicar cursos/treinamentos e responder interesses.
- Proprietário: Painel do proprietário → Ensaio de comunicação — contas fictícias.

## Limites exatos

O ensaio valida transações, regras de negócio, permissões e comunicação interna no banco hospedado. Não é um teste de login dos 150 usuários pelo Auth, nem teste visual em 150 navegadores/celulares. As contas fictícias não têm credenciais de login. Não houve envio de e-mails/SMS, contratação, matrícula, reunião de vídeo, pagamento real ou chamada de IA neste ensaio. Os links de reunião fictícios não correspondem a salas reais.

Esta é uma migração parcial do protótipo. Continuam pendentes: upload/parser integrado, flag SENAI, ações de desenvolvimento, favoritos de currículos, substituição de equipe/médias/pontuação, subusuários/permissões, avaliação/ranking, contraproposta e conflitos de agenda, vídeo e impulsionamento comercial. Ver `PROJECT_REQUIREMENTS.md` no repositório. Os controles existentes não devem ser removidos ao integrar esses módulos.
