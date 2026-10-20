# Notificações no aparelho

Web Push padrão, opt-in por navegador/aparelho na área autenticada → Notificações no aparelho. iPhone/iPad: instalar na Tela de Início e abrir pelo ícone antes de ativar. A permissão deve ser concedida pelo próprio usuário. Não solicita celular.

Novos avisos da central enfileiram envio somente a aparelhos inscritos de contas ativas e não fictícias. Sem envio retroativo do ensaio. Mensagem externa genérica, sem nomes, currículo, entrevista, conteúdo do aviso ou tokens de sessão. O clique abre a central e exige sessão válida. O sistema operacional pode mostrar número, bolinha ou nenhum indicador; não há garantia uniforme de badge.

Fila privada, lease por tentativa, lote de 20 por minuto quando há pendências, até cinco tentativas, expiração HTTP 404/410 remove aparelho. Remetente Web Push VAPID; chaves privadas em Vercel e segredo de disparo em Vault, nunca no código. Cron consulta fila e só chama HTTP se houver trabalho. Sem fornecedor pago adicional; consumo de infraestrutura sujeito aos planos existentes.

Contador atualizado ao abrir/trocar tela, retornar à aba e receber push. Marcar como lido atualiza o ícone do navegador atual. Leitura em outro aparelho pode manter o indicador antigo até uma nova atualização naquele aparelho. Sair remove inscrição local/remota e limpa badge. Sem permissão ou suporte, sino interno permanece disponível.

Ensaio automatizado cobre allowlist de endpoints/SSRF, autenticação, origem, payload sem conteúdo pessoal, badge e clique, fila/lease, rejeição de acesso cliente, leitura antes do envio e remoção de inscrição expirada. Ensaio hospedado com inscrição sintética foi revertido; não representa recebimento real no celular. Para validar entrega, ativar no próprio aparelho: o primeiro cadastro da inscrição cria um aviso de teste na central.
