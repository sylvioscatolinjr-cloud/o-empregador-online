# PWA · versão de teste

O portal mantém o acesso privado e os mesmos dados no servidor. Manifesto raiz com identidade estável, display standalone, ícones 192/512 e ícone Apple 180; ícones reutilizam o símbolo vetorizado da marca. Instalação progressiva via beforeinstallprompt quando disponível e instruções manuais nos demais navegadores.

Mobile: cabeçalho fixo, navegação inferior, menu recolhível do Meu Espaço, áreas de toque de 44 px, formulários em uma coluna, tabelas com rolagem local e margens para áreas seguras do aparelho. Desktop: Visualizar no celular abre iframe com larguras 360, 390 e 768 px. A prévia utiliza os mesmos dados; não é um ambiente separado. Recarregar a página principal após editar na prévia evita trabalhar com sua versão antiga.

Service worker guarda somente a página genérica de reconexão. API, currículos, login e navegação autenticada não são armazenados no Cache Storage. Não há salvamento offline nem sincronização em segundo plano. Atualização segue o ciclo normal do service worker, sem forçar recarga durante preenchimento.

Validação: build, contrato ESM do Worker, testes servidor e fluxos existentes, testes de manifest/ícones/MIME/offline e testes DOM de menu, navegação e prévia. Não houve execução em navegador real; instalação, layout e gestos precisam de validação em Android/iPhone. Critérios de teste manual: 360/390 px sem rolagem horizontal global; preencher ajuda e Salvar e Voltar; selecionar Minha Carreira e Agenda; pausar/favoritar destaques; abrir teclado e modal; instalar e reabrir; desligar conexão e verificar aviso genérico; reconectar e autenticar.

A PWA não ativa integrações de IA, pagamentos, videoconferência ou catálogo entre usuários que ainda estão demonstrativos no portal.
