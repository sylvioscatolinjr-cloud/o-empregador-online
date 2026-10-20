> Atualização da versão 8: veja UPDATE_V8.md para o comportamento atual. A persistência do espaço privado e arquivos está no servidor; os fluxos comerciais multiusuário continuam demonstrativos. A ocultação do nome agora independe do plano do candidato.

# Ocultação do nome em vagas

## Regra aprovada para o protótipo

Ordem: Grátis < Essencial < Profissional < Premium.

Empresas e instituições com assinatura paga podem optar por ocultar o nome da organização em vagas. A opção não se aplica a cursos e treinamentos. O anunciante recebe aviso explícito: candidatos com plano estritamente superior ao da organização podem revelar o nome. Empate mantém a ocultação. A revelação exige clique e deve expor somente a organização, nunca CPF, CNPJ, dados de contato ou identidade pessoal do responsável.

O nome não é necessário para simular candidatura. A ocultação não impede inscrição na vaga.

## Limites atuais

Tudo ocorre somente na apresentação do protótipo privado. O nome permanece nos dados do navegador e pode ser acessado por ferramentas de desenvolvimento. Portanto, não é uma proteção de confidencialidade real. Os planos são simulados, separados por tipo de perfil; representam apenas uma organização por tipo nesse navegador.

## Implementação real

- Obter a assinatura atual de cada organização e candidato no servidor. Não confiar em planos, funções ou flags enviados pelo navegador.
- Retornar a listagem e o detalhe da vaga sem o nome quando oculto. Não embutir esse nome no HTML, bundle, atributos, metadados ou respostas não autorizadas.
- Para revelar, verificar usuário candidato e plano superior no servidor. Retornar somente o nome da organização e registrar a ação de auditoria.
- Manter permissões próprias para a equipe da organização visualizar seus próprios registros.
- Invalidar caches e acessos após mudança de plano. Não guardar respostas com identidade revelada em cache compartilhado.
- Não permitir inferir o nome oculto por busca textual no nome da organização, sugestão automática, exportação, filtros, links de perfil ou agrupamentos não autorizados.
- Exigir ciência da regra pelo anunciante ao publicar. Nome oculto na listagem não deve ser descrito como vaga anônima ou anonimato garantido.
- Explicar que o próprio texto, anexos ou contatos inseridos pelo anunciante podem identificar a organização.
