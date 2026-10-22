# Recuperação de acesso — homologação, 21/10/2026

Escopo: branch feature/oeo-ai-agents, Supabase xxirjbsbfxwzplrcbbjt. Produção preservada. SMTP Titan salvo pelo titular; entrega da mensagem de 14h00 Brasília confirmada pelo destinatário. PILOT_EMAIL_ENABLED=true somente Preview/branch para testar a interface; PUBLIC_REGISTRATION_OPEN=false permanece. Isso não prova recuperação concluída.

Último envio observado: recovery_sent_at 2026-10-21T17:00:08Z. O destinatário relatou otp_expired na raiz. O motivo exato (expiração/consumo/alteração de link) não foi demonstrado; nenhuma atribuição definitiva ao provedor. Modelo anterior usava ConfirmationURL, cujo GET consome o link antes da interface. Documentação Supabase registra prefetch de filtros de email como causa possível.

Novo modelo de homologação: link aponta diretamente à rota /conta/recuperar e leva TokenHash em fragmento. A página remove o fragmento do histórico e mantém o hash só em memória; nenhuma verificação automática. Clique explícito verifica via auth.verifyOtp type recovery, exige sessão retornada e apresenta nova senha. Token inválido/rejeitado não utiliza sessão anterior como prova. Controle de ocupação impede duplo clique. Atualizar página após remoção do fragmento exige reabrir o email, caso ainda válido. Sem novo prazo maior ou relaxamento de autenticação/RLS.

Testes: 156 aprovados, zero falhas/ignorados, incluindo PDF privado local autorizado. Build aprovado. Conclusão real de nova senha depende exclusivamente do titular; não ler senha, link secreto ou códigos. Modelo abaixo deve ser salvo somente após publicação da página compatível. Não enviar nova mensagem automaticamente sem autorização específica.

Finalidade/dados: recuperação solicitada de conta existente, email e credencial temporária estritamente necessários; hipótese aplicável à gestão de acesso ao serviço (art. 7 V), sujeita à avaliação do controlador. Transparência na página/email; senha inserida pelo titular diretamente no Auth. Hash temporário fora de logs do servidor e do DOM, sem analytics novo, removido da URL e memória após uso. Sessão/credenciais continuam com Supabase; retenção e direitos do portal não ampliados. Risco residual: quem obtiver link ainda válido pode autenticar; prefetch com clique automatizado não é impossível. Sem certificação jurídica.

Referências consultadas: LGPD arts. 6, 7, 18, 46 (https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm); ANPD guia de segurança (https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte); Supabase https://supabase.com/docs/guides/auth/auth-email-templates e https://supabase.com/docs/reference/javascript/auth-verifyotp . Changelog consultado: alteração de personalização de templates em Free exige SMTP próprio, já configurado.

## Modelo de email

```html
<h2>Recuperação de acesso — O Empregador Online</h2>
<p>Você solicitou a recuperação da sua conta no ambiente de testes.</p>
<p><a href="{{ .SiteURL }}/conta/recuperar#recovery_token_hash={{ .TokenHash }}">Continuar recuperação</a></p>
<p>Na página do portal, clique em “Continuar e definir nova senha”. O link é de uso único e só será validado após essa confirmação.</p>
<p>Se você não solicitou esta recuperação, ignore este e-mail. Sua senha não foi alterada.</p>
```
