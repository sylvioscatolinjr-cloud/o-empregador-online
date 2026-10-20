# Versão 8 — navegação e armazenamento privado

## Aplicado

- Formulários de perfil, publicação, equipe, carreira, processo, entrevista e avaliação têm Salvar e voltar e Voltar. O retorno usa a tela anterior registrada, não o histórico do navegador. A confirmação do servidor precede o retorno; falhas não são apresentadas como salvamento confirmado.
- A janela de impressão tem Voltar ao currículo e esconde ambos os botões no PDF.
- Persistência real do espaço privado autenticado em R2, separado por identidade do Sites, com proteção de origem e versão condicional contra sobrescrita entre abas/aparelhos. O R2 guarda o documento estruturado da demonstração; não substitui o futuro banco relacional do portal público.
- Importação explícita dos dados de teste existentes neste navegador. Dados não são importados silenciosamente para outra identidade.
- Upload/download privados de PDF/DOCX de até 5 MB. Verificação de extensão e assinatura básica; o arquivo não é extraído, interpretado, publicado nem distribuído a recrutadores externos.
- Exclusão confirmada de vínculos, movimentações e ações de formação. Aviso de incompatibilidade entre a meta e o cenário conservador de preparação.
- Acompanhamento por candidato e etapa, situação individual, processo vinculado a vaga e candidaturas de teste nos dois perfis do espaço. Não envia dados a empresas externas.
- Conflitos por candidato e entrevistador (identificado por nome estável na simulação), exportação ICS para calendário.
- Metadados e filtros de modalidade, experiência e remuneração. Nome oculto excluído da busca por organização.
- Confidencialidade independente do plano: candidato Premium não revela organização oculta. Não há promessa de confidencialidade contra o proprietário que alterna os perfis no próprio espaço privado.

## Integrações ainda necessárias antes do portal público

- Cadastro CPF/CNPJ e autenticação do portal com unicidade real, verificação de e-mail/passkeys e recuperação. A identidade real atual é a autenticação hospedada do Sites; o cadastro do portal continua teste.
- Organizações e equipes multiusuário, permissões no servidor e aprovação pelo responsável em sua própria sessão. O seletor de membro e aprovação por senha fictícia continuam simulação, sem autoridade sobre a API do espaço privado.
- Banco relacional de organizações, candidatos, vagas, candidaturas, seleção, acesso aos currículos e eventos. O estado privado atual não compartilha registros entre visitantes.
- Serviço de e-mail, notificações, criação de salas de vídeo, pagamentos e API de IA. Não existem chaves configuradas nem cobranças reais.
- Distribuição global de campanhas por relevância/plano/rodízio, contabilização de impressões visíveis e relatórios. O rodízio atual continua demonstrativo e não garante exposição real.
- Preços, franquias e custos por assinatura: dependem do custo efetivo das integrações e da definição comercial; não foram inventados.

## Verificação

Testes de regras e DOM para navegação/retorno, falha de salvamento, carreira, etapas individuais, agenda e nome oculto; testes da API para isolamento, falta de autenticação, CSRF, conflitos de versão e limites de arquivo. Verificação visual em navegador e celular não disponível no ambiente desta edição.
