# O Empregador Online

Código disponibilizado pelo proprietário para revisão técnica independente em 20/10/2026.

## Onde revisar

- `pilot-sumare/`: aplicação real publicada na Vercel, com Supabase e integração Asaas.
- `pilot-sumare/api/` e `src/`: endpoints e regras.
- `pilot-sumare/supabase/migrations/`: estrutura, funções e políticas do banco.
- `pilot-sumare/tests/`: testes automatizados.
- `PROJECT_REQUIREMENTS.md`: decisões e inventário de implementação; atualizações ao final corrigem estados históricos anteriores.
- `pilot-sumare/docs/BILLING_LIVE.md`: cobrança real e limitações atuais.
- `web/` e `worker/`: protótipo anterior, com recursos demonstrativos; não confundir com produção.

## Executar verificações

No diretório `pilot-sumare`, execute `npm ci`, `npm test` e `npm run build`. Confira também seu README e `.env.example`. Segredos e dados reais devem permanecer fora do repositório. O teste opcional de PDF privado pode ser ignorado quando o arquivo não estiver disponível.

## Estado e escopo

Esta é uma fotografia do código da revisão de origem `87c66857d569b935dab9e61212bd5f6db6b69edf`. O histórico anterior permanece no repositório de desenvolvimento e não foi publicado aqui. Arquivos gerados de build, pacotes antigos de implantação e metadados locais de hospedagem foram excluídos. Bibliotecas de terceiros e suas licenças foram preservadas.

Cobrança real publicada, restrita ao proprietário durante validação. Até a última consulta, não havia pedido ou pagamento real registrado. IA por nível, consumo efetivo de créditos, liberação de treinamentos, prioridade paga e receita no painel geral ainda exigem integração. Não tratar o backlog ou recursos do protótipo como concluídos.

## Orientação para avaliação independente

Investigue autenticação/autorização, isolamento de perfis, RLS e funções SECURITY DEFINER, validação de documentos, privacidade, uploads, idempotência e concorrência de pagamentos, webhooks, cancelamentos/estornos, consistência dos planos, acessibilidade e desempenho. Classifique cada achado por gravidade, cite arquivo e trecho, apresente reprodução e correção sugerida. Separe falhas reproduzidas de hipóteses e funcionalidades ainda pendentes. Não execute alterações ou cobranças no ambiente real durante a revisão.

## Publicação e privacidade

Publicação pública autorizada expressamente pelo proprietário para avaliação de código. Exportação limitada a fontes, testes sintéticos e recursos do projeto; não inclui banco de usuários, arquivos privados, variáveis de ambiente ou credenciais de produção. Padrões de chaves/tokens e literais de senha foram revisados nos arquivos de texto; senhas presentes nos testes são fictícias. Isso não equivale a auditoria de segurança completa. Referência de minimização e segurança: LGPD, arts. 6 e 46, texto oficial consultado em 20/10/2026: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm.
