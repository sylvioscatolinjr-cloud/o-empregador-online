# O Empregador Online — protótipo privado de revisão

Acesso restrito ao proprietário pela hospedagem Sites. A atualização mantém a política de acesso existente e não concede acesso a outras pessoas.

## Experiência demonstrada

- Página inicial do portal preservada, incluindo os carrosséis de vagas, cursos/treinamentos e currículos impulsionados. Roteiro guiado com entradas por empresa, candidato, instituição e proprietário em uma tela separada, acessível por Roteiro de testes.
- Processo com etapas personalizadas, datas, progresso reversível e andamento individual por candidato.
- Agenda em Brasília; conflitos por candidato e entrevistador; aceite, recusa e contraproposta com aceite/recusa pela empresa.
- Janela de entrada na entrevista: cinco minutos antes até o final previsto. Atalho explícito para preparar uma sessão imediata de teste.
- Pré-entrada, controles e encerramento de sala simulada. Sem câmera, microfone, gravação ou transmissão reais.
- Avaliação interna com critérios comuns, notas de 0 a 10 e evidências. Média por entrevista e por candidato; empates compartilham posição; candidatos sem nota ficam fora do ranking.
- Meu Espaço → Minha Carreira: vínculos, promoções, linha do tempo, gráficos de salário e responsabilidade, meta editável e plano assistido por regras com horas e custos.
- Dashboard do proprietário: quatro indicadores, seis períodos e gráficos; central de avisos segmentada com sino, contador e confirmação de leitura.
- CEP obrigatório na publicação de vagas, cursos e treinamentos; consulta fictícia no protótipo.

## Isolamento e limites

O modo de revisão usa dados sintéticos e e-mails example.com. As requisições de API do navegador são atendidas localmente, sem ler o espaço original ou escrever no servidor. As alterações do teste persistem apenas neste navegador, em chaves próprias. O botão Reiniciar exemplos restaura a demonstração e preserva os dados originais. A hospedagem continua autenticada e privada.

Não há envio real de convites, notificações externas, pagamento ou integração com IA. A sala de vídeo demonstra a jornada; o planejamento de carreira usa regras e estimativas explícitas. A versão não representa uma operação multiusuário de produção.

## Validação

`tests/private-demo.cjs` exercita a aplicação carregando os scripts na ordem do HTML: presença dos três carrosséis na página inicial, setas, pausa/retomada, troca automática, favorito sem reconstruir a vitrine, navegação ao roteiro separado e retorno; criação de processo, conclusão/reversão de etapas, agendamento e conflito, três respostas do candidato, duas respostas da empresa à contraproposta, pré-entrada/sala/encerramento, avaliação/ranking e ocultação de observações, histórico/gráficos/meta/plano, seis filtros do proprietário, segmentação/aviso/contador/leitura e persistência. Confirma zero chamadas reais de API/rede.

Também passaram as suítes existentes de fluxos, interface administrativa, servidor, API administrativa, tipos de vaga, qualidade, PWA e carrossel, além da validação do Worker gerado.

A infraestrutura de inspeção visual em navegador não estava disponível nesta execução. A experiência foi validada por testes automatizados de DOM e lógica, sem uma revisão visual em navegador real.
