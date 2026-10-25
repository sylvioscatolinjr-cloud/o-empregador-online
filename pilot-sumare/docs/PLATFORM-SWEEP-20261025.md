# Varredura funcional e visual — 25/10/2026

## Correções
| Problema confirmado | Correção |
| --- | --- |
| Resposta de assinatura podia permanecer após trocar/encerrar conta | Invalidação imediata da tela e verificação da identidade antes/depois de cada consulta, incluindo catálogo de upgrade; resposta tardia descartada. |
| Receita era filtrada por checked_at, que muda ao conferir | Nova coluna provider_paid_on nos dois registros financeiros, preenchida somente pela data de confirmação/pagamento validada do Asaas. Conferência técnica permanece separada; sem usar vencimento, data estimada de crédito ou relógio local como recebimento. |
| Assinatura ativa sem período pago ainda entrava no MRR | Contagem/MRR exigem pagamento elegível no período vigente e valor correspondente. Períodos pagos de renovação cancelada aparecem separadamente. |
| Tentativas expiradas podiam contar como novas assinaturas | Somente pedidos com evidência de pagamento são contados; pedido abandonado não vira venda. Pedido de cancelamento sem confirmação não conta como cancelamento concluído. |
| Apagar imagem reduzia o histórico de gerações | Gerações concluídas e posteriormente excluídas continuam contadas, sem contar testes do proprietário ou falhas. |
| Texto ampliado escapava do cabeçalho, títulos, totais e mensagens diretas | Quebra de texto no nome do portal, títulos/valores e conteúdo principal; cores, tipografia e comportamento de seleção preservados. |

O painel identifica valores brutos confirmados não estornados, não lucro ou saldo bancário disponível. Pagamentos históricos sem data do provedor ficam sinalizados e fora dos totais por período até uma conciliação real trazer a informação. Nenhuma data histórica foi inventada a partir da última leitura. A conferência normal de pagamento já existente atualiza esse metadado sem criar nova compra.

## Verificação
- Build aprovado;387 testes aprovados, zero falhas, um PDF privado ausente ignorado (388 total).
-14 testes focados finais de sessão/tela aprovados; regressões de indicadores, datas e carteira cobertas na suíte completa.
-Sintaxe de111 módulos próprios verificada sem erro;122 referências internas de arquivos/páginas verificadas sem destino ausente, considerando rewrites/redirects do Vercel.
-Chromium153:143 verificações em larguras320–1280 e73 adicionais com texto ampliado a400%, total216 sem transbordamento, corte de controles ou variação de tamanho por seleção. Inclui14 páginas públicas/estados sem sessão e componentes reais de planos/treinamentos/painel com dados fictícios. Não equivale a todas as sessões autenticadas, aparelhos físicos ou leitor de tela.
-12 bundles verificados sem padrão de chave secreta real; não é certificação de ausência de toda vulnerabilidade.
-Migração20261025041025_stable_payment_dates aplicada: duas colunas de data e atualização mínima dos RPCs existentes, conservando locks, escopo, idempotência, rejeição de snapshot antigo e créditos/consumos. Sem tabela/grant público/SECURITY DEFINER novo.
-Ensaio hospedado com role service_role e rollback validou data estável, snapshot antigo ignorado, crédito/consumo preservados e acesso direto do navegador negado; zero usuários/turmas sintéticos remanescentes.
-Advisors antes/depois:33 INFO esperados de tabelas service-only sem políticas e1 WARN anterior de proteção contra senhas vazadas desativada, sem nova ocorrência.

Nenhum checkout, compra, cancelamento, estorno, mensagem, chamada paga de IA ou alteração de carteira real foi usado para fechar a revisão. Preços,20/25/30/30%, contratos versionados, quatro níveis,36 treinamentos, modo proprietário e venda real permanecem.

## Limites e pendências
A configuração de bloqueio de senhas vazadas no Supabase segue pendente; o conector disponível não oferece alteração de Auth Settings. É recurso Pro ou superior conforme a documentação oficial, sem afirmar qual é o plano atual do projeto. Remediação: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . Não houve mudança de plano do fornecedor.
Continuam separados: dados jurídicos preliminares, revisão de adolescentes e autorização institucional do piloto, aceite físico de PWA/leitor de tela e pagamentos reais já listados no checklist. Não declarar o portal integralmente concluído nem homologação financeira real por testes simulados.

## Privacidade e operação
Finalidade contratual de manter assinatura/compra correta, indicadores administrativos e isolamento de conta (referência LGPD art.7,V e segurança art.46). Novo dado mínimo: dia de confirmação/pagamento que o Asaas já informa; sem novo fornecedor, coleta de cartão/documento ou divulgação pública. Originais de currículo, prompts e imagens privadas não entram no painel nem no relatório. Acesso permanece próprio/administrativo, service-only no financeiro; retenção, atendimento e direitos existentes preservados. Política de Privacidade atualizada no mesmo PR.
Fontes oficiais revistas: LGPD/Planalto; guia de segurança da informação/ANPD; Supabase funções/RLS e segurança de senhas; https://docs.asaas.com/docs/payment-events . Não constitui certificação jurídica ou auditoria independente.

Reversão: preservar colunas financeiras e registros; correção de código compatível e, se necessário, PUBLIC_SUBSCRIPTIONS_ENABLED=false + redeploy pausa somente novas contratações públicas, sem apagar ou reclassificar pagamentos. Não reverter para versões que desconhecem nível4. Alterações são publicadas por branch/PR/prévia/merge.
