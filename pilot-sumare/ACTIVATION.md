# Ativação do piloto real

## Situação confirmada em 15/10/2026

- O portal Sites publicado é uma demonstração pública por link; cada navegador mantém seus testes.
- Projeto Supabase **O Empregador Online** encontrado e saudável, na organização Sylvio Scatolin; a estrutura e os índices foram aplicados e o isolamento foi validado remotamente.
- Projeto Vercel **o-empregador-online-piloto** criado e implantado: https://o-empregador-online-piloto.vercel.app. A proteção nativa Vercel foi retirada após autorização explícita em 15/10/2026 às 18h32 (Brasília); página inicial e `/api/config` responderam HTTP 200 anonimamente. O cadastro ainda está desabilitado por falta de configuração dos serviços.
- A consulta inicial de custo estava indisponível; o proprietário criou o Supabase diretamente. Não foi alterado o plano ou a região escolhida.

## Criação do banco — concluída

O proprietário criou o projeto `mynjocetbsiaukefhkmz`. A região encontrada foi `us-east-2`; ela foi preservada. As migrações aplicadas estão em `supabase/migrations/`. Não aplicar novamente essas migrações ao mesmo banco. Os próximos passos são SMTP, URLs de retorno, segredos de servidor, verificação da aplicação e liberação dos participantes.

## Autenticação e envio

- Habilitar acesso por e-mail/senha e manter confirmação de e-mail obrigatória. As senhas são tratadas pelo Supabase Auth, não por tabelas próprias do portal.
- Definir o endereço HTTPS definitivo do piloto e autorizar apenas as URLs de retorno `/conta/confirmar` e `/conta/recuperar` nessa origem. Atualizar os endereços ao mudar para o domínio próprio.
- Configurar SMTP em Authentication → SMTP. Se usar caixa HostGator, confirmar com o plano contratado host, porta/TLS, limites e remetente; inserir as credenciais diretamente no painel. Não enviar senha SMTP nesta conversa.
- Confirmar SPF/DKIM/DMARC e entrega de confirmação e recuperação em contas de teste reais. O envio padrão do Supabase não atende destinatários externos à equipe do projeto.
- Configurar limites e proteção contra abuso antes de liberar uma turma inteira. O flag `PILOT_EMAIL_ENABLED` da aplicação apenas habilita a interface; não configura nem prova entrega.

## Banco e aplicação

1. Aplicar a migração inicial somente em projeto dedicado vazio, depois de conferir versão e permissões; executar advisors e testes de RLS no Supabase real.
2. Criar a turma com nome oficial e datas corretos. Aprovações e ingresso iniciam desabilitados. Liberar somente após os responsáveis confirmarem as condições do piloto.
3. Configurar a Vercel com esta pasta como raiz. Variáveis estão em `.env.example`. URL/chave publicável são valores do cliente; chave secreta e segredo HMAC são valores de servidor. Nunca publicar os dois últimos no cliente ou no repositório.
4. Gerar o segredo HMAC aleatório no servidor e manter estável: mudar esse segredo sem migração impede comparar identidades previamente cadastradas.
5. Implantar e confirmar a URL antes de trocar o apontamento do domínio. A Vercel fornecerá seus próprios registros DNS; os registros atuais do Sites não devem ser reutilizados para um projeto Vercel.
6. Criar convites de teste com expiração e e-mail destinatário, guardando somente o hash do token no banco. Não criar senhas de alunos ou cadastrar endereços de terceiros para testar envios sem autorização.
7. Testar em contas/aparelhos diferentes: confirmar e-mail, entrar, recuperar acesso, concluir documento, resgatar convite, salvar currículo/meta, sair e verificar isolamento.

## Para concluir o produto completo

Esta primeira fatia tem contas, ingresso e persistência de currículo/meta. Ainda precisam ser ligados a dados compartilhados e permissões reais: vagas/cursos, currículos visíveis por candidatura, departamentos/equipes, convites por e-mail, processos seletivos, agenda com conflitos, resposta do candidato, provedor de entrevista, avaliação privada/ranking, carreira completa e administração. Os botões demonstrativos de troca de perfil/pessoa não devem ser levados à aplicação real como controles de autorização.

Antes de liberar os cerca de 300 alunos, executar ensaio de carga e concorrência no ambiente hospedado, testar limites de envio, armazenamento de anexos, recuperação/backup e os caminhos entre candidatos, recrutadores e escola. Os testes locais não certificam capacidade de produção.

Fontes: https://supabase.com/docs/guides/auth/passwords · https://supabase.com/docs/guides/auth/auth-smtp · https://supabase.com/docs/guides/database/postgres/row-level-security
