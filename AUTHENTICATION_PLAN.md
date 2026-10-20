> Atualização da versão 8: veja UPDATE_V8.md para o comportamento atual. A persistência do espaço privado e arquivos está no servidor; os fluxos comerciais multiusuário continuam demonstrativos. A ocultação do nome agora independe do plano do candidato.

# Próxima etapa: autenticação e autorização reais

Esta versão é um protótipo privado hospedado com autenticação ChatGPT. Formulários de senha, código de e-mail, usuários da organização e autorizações pontuais são demonstrações no navegador. Não constituem autenticação do portal nem controles de acesso do servidor. Nenhum pagamento deve ser integrado a estes controles locais.

## Modelo de dados proposto

- Usuário: ID, e-mail normalizado e único, status de confirmação, identidade da autenticação suportada.
- Candidato: vínculo ao usuário, CPF normalizado com chave de unicidade no servidor. A validação dos dígitos não comprova titularidade. Definir verificação de identidade antes de usar o documento para impedir acesso legítimo.
- Organização: CNPJ normalizado único, suporte aos formatos numérico e alfanumérico. Uma mesma organização não deve ser recriada ao adicionar novos membros ou habilitar outro tipo de perfil.
- Membro: organização, usuário individual, status, permissões. As permissões valem apenas para a organização correspondente.
- Convite: e-mail do destinatário, token de uso único com expiração. Cada pessoa define sua própria senha; nunca enviar senha em texto.
- Autorização pontual: principal, solicitante, organização, ação exata, valor, expiração e uso único. A autorização não amplia permanentemente as permissões do solicitante.
- Registro de auditoria: responsável, ação, recurso, horário e resultado. Não registrar senhas ou códigos.

## Autenticação

Preservar a integração suportada pela hospedagem. Confirmar suporte a um provedor externo antes de implementar login independente por e-mail/senha. Será necessário um serviço de autenticação e um canal de envio de e-mail; nada disso está configurado nesta versão.

Se e-mail/senha for suportado: proteger sessões no servidor, verificar e-mail antes da ativação, armazenar somente hash adequado de senha no serviço de identidade, aplicar limitação de tentativas e recuperação de acesso. CPF/CNPJ não substituem prova de identidade.

Código de segunda etapa: gerar aleatoriamente no servidor, armazenar verificador protegido, prazo curto, número limitado de tentativas, uso único, vínculo à sessão e invalidação de códigos anteriores ao reenviar. Nunca incluir código válido no navegador ou no histórico de logs.

Biometria: integrar WebAuthn/passkeys com desafio e conferência no servidor, vínculo à conta e verificação do usuário no aparelho. Não armazenar impressões digitais nem imagens faciais. O desbloqueio pode ocorrer também por PIN do dispositivo; não prometer biometria obrigatória em todo aparelho.

## Autorização

Conferir permissões no servidor em todas as operações: editar perfil, publicar, buscar candidatos, usar IA, contratar planos, comprar créditos e gerenciar usuários. Filtrar leituras e escritas por organização autorizada. Ocultar botões é somente apresentação.

Compra sem permissão: solicitar aprovação do responsável com reautenticação própria; vincular aprovação ao item e ao valor, expirar e consumir uma única vez. Preferir aprovação na sessão do responsável em vez de compartilhar sua senha com outro usuário.

O protótipo inclui troca visível de usuário de teste e aprovação por senha fictícia. Remover ambos ao ativar controles reais.

## Fontes do formato de CNPJ

Manual Receita Federal/SERPRO: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf
