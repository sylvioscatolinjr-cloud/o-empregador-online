# Imagens opcionais nos cards — 18/10/2026

Candidato: Meu currículo → Meu cartão na página inicial → Incluir minha foto no card. Usa a foto já salva no currículo; opção desmarcada por padrão, separada da autorização de foto na impressão/candidatura. Cartão precisa estar visível. Desmarcar e salvar remove a cópia publicada; apagar/substituir a foto do currículo sincroniza essa cópia.

Empresa e instituição: Dados da organização → Incluir logo nos cards dos anúncios. Opção desmarcada por padrão, aplicada a publicações existentes e futuras. Sem autorização, o logo fica apenas no registro da organização e não segue aos anúncios. Desmarcar preserva o arquivo original e limpa as cópias nos anúncios.

Imagem 64 × 64 no canto superior direito; marca Fictício imediatamente abaixo nos exemplos. Sem imagem, marca no local anterior. Reservado espaço para impedir sobreposição. Carrosséis e regras de acesso mantidos.

## Banco e segurança

Migração `20261018144012_optional_featured_card_images`. Triggers privados controlam a cópia: o cliente não escolhe fonte de foto de terceiro nem escreve diretamente a imagem publicada. RLS e público autorizado anteriores preservados. Foto nunca entra em pontuação/classificação. Formato raster compacto validado; sem URL externa ou SVG. Nenhum bucket novo.

Consulta oficial LGPD: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm em 18/10/2026, arts. 6, 7 I, 8, 9, 18 e 46. Finalidade é identificação visual voluntária no cartão, com autorização específica e retirada facilitada. A autorização do cartão é distinta da candidatura e não concede acesso ao currículo privado. Cópia publicada mantida apenas enquanto opção e visibilidade ativas; arquivo privado mantido para edição até remoção pelo titular. Não há reconhecimento facial nem extração biométrica. Fotos públicas podem revelar características pessoais e ser copiadas por visitantes; retirada interrompe novas leituras, não apaga cópias já feitas por terceiros. Não se afirma certificação de conformidade integral.

## Demonstração

`db/fixtures/card-images.json` guarda quatro imagens sintéticas WebP de 160 × 160; dois retratos reutilizados nos 25 candidatos, um logo Nexo reutilizado em 25 empresas e um logo Horizonte em 25 escolas. Outros 25 de cada tipo permanecem sem imagem. Nenhuma foto de pessoa real fornecida na conversa foi usada. Contas existentes preservadas e bloqueadas para login.

Geração pelo image_gen integrado: retrato fictício de adulto brasileiro com camisa turquesa, retrato fictício de adulta com blusa roxa, símbolo N abstrato roxo/turquesa para Nexo Soluções, livro e sol roxo/turquesa para Instituto Horizonte; fundo neutro/branco, sem texto ou referência real. Arquivo do projeto: `pilot-sumare/db/fixtures/card-images.json`. Conversão para miniatura por canvas, sem alteração de identidade.

`node scripts/seed-card-images.mjs <arquivo.sql>` produz SQL idempotente restrito às contas demo .invalid com marcador demo, associação fictícia e login banido. Não gera novos usuários. Banco hospedado confirmou 50/25/25 por categoria e 25 vagas + 25 cursos com logo.

Validação: testes de markup/DOM, isolamento, autorização, retirada, substituição e sincronização no PGlite; leitura e contagens no banco hospedado. Revisão visual em navegador/dispositivo indisponível nesta sessão.

Resultado da suíte: 103 aprovados, 0 falhas, 1 teste do PDF privado não executado nesta rodada (não relacionado à alteração). Build aprovado. Advisors sem novo aviso: permanecem os avisos anteriores de tabelas restritas sem políticas de acesso direto e proteção de senhas vazadas desabilitada.
