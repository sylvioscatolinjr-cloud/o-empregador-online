# Conferência de senhas vazadas (sem custo)

A proteção nativa do Supabase contra senhas vazadas só existe no plano Pro. Para não depender dela,
o portal confere a nova senha no próprio navegador, no cadastro e na troca/recuperação de senha.

## Como funciona
- `src/password-breach.mjs` calcula o SHA-1 da senha no navegador (`crypto.subtle`).
- Só os 5 primeiros caracteres do hash vão para `https://api.pwnedpasswords.com/range/<prefixo>`
  (modelo k-anonimato do Have I Been Pwned). A resposta traz centenas de sufixos; a comparação é local.
- Se o sufixo aparecer, o envio é recusado com: "Essa senha já apareceu em vazamentos de dados
  conhecidos. Escolha outra senha." O Supabase não chega a ser chamado.
- Se o serviço falhar, demorar mais de 4 s ou estiver fora do ar, o cadastro segue normalmente
  (o Supabase continua exigindo 12 caracteres). Uma queda do serviço externo nunca bloqueia contas.
- `vercel.json` inclui `https://api.pwnedpasswords.com` no `connect-src` da CSP (hoje em report-only).

## LGPD / ANPD
- Nenhum dado pessoal sai do portal: não vão senha, hash completo, e-mail, nome, cookies nem
  referer (`credentials: 'omit'`, `referrerPolicy: 'no-referrer'`). O prefixo de 5 caracteres é
  compartilhado por centenas de senhas e não identifica a pessoa (art. 5º, III, dado anonimizado).
- Finalidade: segurança das contas (art. 6º, VII, e art. 46). Não há armazenamento nem registro.
- A Política de Privacidade pode citar o Have I Been Pwned como ferramenta de segurança usada sem
  envio de dados pessoais; fica para a revisão do advogado.

## Conferir na prévia da Vercel
1. Criar conta de teste com a senha `password1234` (vazada) e confirmar a mensagem de recusa.
2. Criar conta com uma senha longa e aleatória e confirmar que segue para a confirmação de e-mail.
3. Se o plano Pro for contratado no futuro, a opção do Supabase pode ser ligada também; as duas convivem.
