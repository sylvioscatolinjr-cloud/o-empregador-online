# Agentes de IA — Fase 1 (21/10/2026, PR em revisão, não publicado)

Pedido do usuário em 21/10/2026: visão dos três agentes (Carreira, Gestão e Talentos, Evolução Educacional) com Fase 1 de fundação, e escolha "Eu conduzo aqui" para unir o PR #5 aos PRs #2 e #4. Pedido específico: o revisor deve ler os campos preenchidos e o arquivo enviado, sugerir melhorias, e o candidato escolhe manter o original ou aceitar e salvar.

## O que a Fase 1 entrega
- **Um fornecedor, um adaptador.** `src/ai-provider.mjs` concentra a chamada ao Claude (`claude-opus-5-5`, trocável por `AGENT_AI_MODEL`). Redator de vagas, Revisor de currículo e o chat guiado do #5 usam o mesmo adaptador. A OpenAI sai do chat guiado; o agente editorial do proprietário continua como estava.
- **Cobrança única.** `src/agent-metering.mjs`: cada uso reserva uma vaga diária (`AGENT_DAILY_LIMIT`, padrão 10 por agente), o primeiro uso do dia nas tarefas com dados do portal é gratuito (`AGENT_FREE_DAILY_LIMIT`, padrão 1), e os seguintes debitam R$ 1,00 dos créditos do plano pelas funções do #5 (`portal_ai_paid_reserve`/`portal_ai_paid_refund`). Falha da IA devolve o crédito. O chat guiado é sempre pago e só funciona com `AI_CHAT_METERING_ENABLED=true`. Proprietário não é cobrado. Contas fictícias não usam agentes.
- **Contexto do banco.** O revisor lê o currículo salvo (`pilot_profiles`) e a meta (`pilot_goals`) no servidor. O arquivo enviado é lido no aparelho, como na importação, e só o texto segue; o servidor retira nome, CPF, e-mail e telefone. O redator usa o nome da organização cadastrada.
- **Escolha do candidato.** Para resumo, competências, cada experiência e cada texto livre (experiência, formação, cursos, certificações), a tela mostra "Atual" e "Sugestão da IA" com "Usar sugestão" ou "Manter original". Nada é gravado até "Salvar currículo". A revisão exige o currículo salvo.
- **Histórico.** `portal_agent_history` guarda o resultado de cada uso concluído, visível e apagável só pelo dono (RLS), apagado após 180 dias. Aparece em Meus agentes, base da memória de objetivos da Fase 2.
- **Meus agentes.** Atalhos para as tarefas com dados ("Revisar meu currículo com IA", "Escrever anúncio com IA") e tarefas guiadas por plano. Candidato nível 1 passa a ter preparação de entrevista e plano de carreira, conforme a tabela de planos do usuário; o anúncio de vaga deixa o chat e vai para o formulário de publicação.

## Ativação (nada é ativado por este PR)
1. Aplicar no Supabase, em ordem: `20261020160000_portal_agent_runs.sql`, `20261020200000_portal_agent_resume_reviewer.sql`, `20261021190000_portal_agent_phase1.sql`, além das migrações do #5 em `pilot-sumare/migrations/`.
2. Criar `ANTHROPIC_API_KEY` no Vercel (Production, Sensitive). Sem ela as rotas respondem 503 e não reservam uso.
3. Ligar `AI_CHAT_METERING_ENABLED=true` só depois da homologação financeira do #5.
4. Medir o custo real: `portal_agent_runs.usage` guarda tokens de cada uso; somar por tarefa antes de fixar limites e preços.

## LGPD
- Finalidade: orientar o titular (currículo, carreira) ou o anunciante (anúncio), a pedido dele. Base: execução de serviço solicitado (art. 7º, V); para adolescentes de 16 e 17 anos, melhor interesse (art. 14; Enunciado CD/ANPD nº 1/2023): só o titular pede, nada é publicado.
- Minimização: dos campos vão resumo, competências, cargos e descrições, formação, cursos e certificações; não vão contatos, foto, dados adicionais nem nomes de empregadores. Do arquivo vão o texto sem nome, CPF, e-mail e telefone; outros dados que o candidato tenha posto no arquivo (como endereço) podem seguir, e a tela avisa.
- Transferência internacional: Anthropic (EUA), informada nas telas; incluir na política de privacidade e confirmar cláusulas contratuais (art. 33).
- Retenção e direitos: histórico de 180 dias, apagável pelo titular a qualquer momento; registro de uso guarda só contagens, modelo, tokens e situação.
- Controle humano: nada é publicado nem gravado sem clique do usuário.
- Riscos: inventar fatos (proibido no prompt e revisão do usuário), dado pessoal no texto (remoção automática), custo (teto diário, esforço baixo, medição por tokens).
