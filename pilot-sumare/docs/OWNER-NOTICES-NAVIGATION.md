# Proprietário e envio de avisos — 22/10/2026

A consulta mínima de produção confirmou sylvio.scatolin.jr@gmail.com como pilot_owner ativo, e-mail confirmado e login sem bloqueio. Não há conta Auth para master.sylvio@oempregadoronline.com.br nem para o prefixo sylvio.cscatolin; na homologação, nenhuma dessas grafias foi encontrada. master.sylvio é apenas o mailto de contato na página de assinatura. O endpoint administrativo valida a identidade do token e o vínculo ativo no banco; não usa esse mailto para autorizar. Nenhuma conta, permissão, senha, assinatura ou carteira foi movida ou alterada.

O envio já existia no fim do painel, depois dos gráficos. Agora há botão Enviar avisos no menu do proprietário, atalho no começo do painel e tela dedicada /conta.html?gerenciar-avisos=1. O painel e a tela exibem o e-mail autenticado da própria conta. Perfis comuns não veem o atalho e não abrem a tela por URL; API mantém verificação do proprietário em cada chamada.

Fluxo: informar título e mensagem, selecionar perfil/região/UF/cidade, clicar Conferir destinatários, revisar texto/filtros/quantidade e Confirmar envio para esse grupo. Se editar qualquer campo, a confirmação anterior é invalidada. Falha de prévia não autoriza envio; primeira confirmação consome a autorização local para evitar clique duplicado enquanto aguarda. Destinatários recebem aviso interno no sino; não é um disparo de e-mail. A quantidade pode variar se a elegibilidade mudar entre prévia e envio: o servidor reavalia os filtros. Não há lista nominal de destinatários.

Validação sem avisos reais: testes DOM com API simulada e testes existentes do endpoint/banco. Não enviar mensagem de teste para usuários reais só para validar navegação. Sem migração ou mudança de critérios de destinatários.

Privacidade: finalidade de tornar acessível a comunicação administrativa já solicitada; dados mínimos de conta própria e prévia agregada, sem novo cadastro, lookup externo ou retenção. Hipótese de trabalho: execução do serviço solicitado, preservando os critérios e direitos existentes. Risco principal é envio para o grupo errado: prévia com filtros/texto e invalidação na edição reduzem esse risco. Persistência dos avisos e atendimento a direitos continuam no fluxo existente. Sem certificação jurídica integral.

Fontes oficiais revistas: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm e https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-vf.pdf .

Resultado: suíte geral 259 aprovados, zero falhas, um PDF privado ausente ignorado. Após proteção adicional contra prévia tardia ao reabrir a tela, 30 testes focados e build aprovados. O ensaio é simulado/local; nenhum aviso foi disparado para pessoas reais nesta alteração.
