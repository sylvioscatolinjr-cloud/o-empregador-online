> Atualização da versão 8: veja UPDATE_V8.md para o comportamento atual. A persistência do espaço privado e arquivos está no servidor; os fluxos comerciais multiusuário continuam demonstrativos. A ocultação do nome agora independe do plano do candidato.

# Agenda, entrevistas e processos seletivos

## Versão de teste

Organizações criam processos com título, até 20 etapas e até 10 critérios de avaliação. Etapas recebem dia/hora em Brasília e possuem botão reversível de conclusão. A agenda mostra o cronograma das etapas e entrevistas agrupadas por dia.

Contratante escolhe processo, candidato, data, duração, orientações e link HTTPS de sala externa. Convite começa Pendente. O candidato pode aceitar, recusar ou propor novo horário. Contratante pode aceitar a proposta (confirma a nova data) ou recusá-la (horário original volta a aguardar confirmação). Confere sobreposição de horários do candidato ou organização.

Após aceitação, o botão da sala externa aparece de cinco minutos antes até o fim previsto. A disponibilidade é atualizada a cada 30 segundos enquanto a agenda está aberta. O serviço de vídeo externo administra participantes e chamada; o portal não cria sala, não grava vídeo e não oferece videochamada embutida nesta versão.

Contratante pode simular entrevista realizada para testar a avaliação antes da data. Na operação real, remover este atalho. Os mesmos critérios são aplicados a todos os candidatos do processo. Notas de 0 a 10 têm pesos iguais; a nota da entrevista é a média dos critérios. A nota de um candidato no ranking é a média das entrevistas avaliadas desse processo. Empates compartilham posição. Observações são internas, com evidências, e não aparecem na área de candidato.

Adicionar permissão independente de gerenciar recrutamento aos membros da organização. Respostas e dados permanecem somente neste navegador. O seletor de candidato serve para simular ambas as partes; remover ao ativar contas reais.

## Próxima etapa

- Persistir organizações, processos, etapas, candidatos, participantes, convites, versões de proposta e avaliações no servidor com autorização por organização.
- Usar identidades reais: candidatos só respondem aos seus convites; usuários da empresa precisam de permissão de recrutamento para criar, alterar ou avaliar. Proteger avaliações e notas nas respostas do servidor.
- Controlar transições concorrentes, histórico de alterações e confirmação de horário. Conferir conflitos considerando entrevistadores específicos e calendários externos, não somente uma organização inteira.
- Enviar notificações e lembretes por serviço configurado, respeitando preferências. Esta versão não envia mensagens.
- Integrar fornecedor de vídeo com salas privadas, participantes autorizados e acesso temporário. Não tratar URL pública como proteção suficiente. Confirmar permissão do usuário antes de enviar convites a pessoas.
- Armazenar instantes em UTC e usar fuso IANA America/Sao_Paulo para exibição ou o fuso escolhido pelo participante.
- Bloquear alterações de critérios que comprometam a comparabilidade após avaliações, ou versionar rubricas e recalcular somente com revisão explícita.
- Não automatizar decisão de contratação a partir do ranking. O painel deve expor critérios, evidências, avaliações ausentes e empates.
- Eventual gravação exige configuração explícita, controles de acesso e comunicação aos participantes. Nada é gravado pelo protótipo.
