# Revisão do alinhamento dos botões — 23/10/2026

O formulário Buscar vagas usava um campo com largura integral dentro de uma linha flexível, comprimindo o botão. O campo agora ocupa o espaço restante; o botão conserva a largura do texto e o formulário se reorganiza em telas pequenas.

A revisão também corrigiu o menu móvel que ultrapassava a página, endereços de atendimento longos, grupos de ações, atalhos do proprietário e controles de ajuda/referências com texto ampliado. A identidade visual e o estado de seleção foram preservados.

Validação: build local concluído; 66 testes focados aprovados. Chromium 153: 175 combinações de páginas/componentes e larguras de 320 a 1280 px, sem texto fora dos botões ou transbordamento horizontal; mais 16 verificações com texto a 200%/400%, aprovadas. Foram usados 14 caminhos reais e componentes renderizados com dados fictícios dos três perfis. Não equivale a testar sessões reais autenticadas, aparelhos físicos ou leitores de tela.

Privacidade/LGPD: alteração de apresentação; sem nova coleta, mudança de permissões, cobrança ou retenção. Revisão de continuidade e orientações oficiais de proteção de dados consideradas. Evidências de navegador e capturas temporárias permanecem fora do repositório.

O bloqueio da geração de imagens por falta de permissão na API OpenAI permanece: AI_IMAGE_GENERATION_ENABLED=false, sem reserva/cobrança de imagens. Não ativar antes da validação real do provedor e da entrega privada.
