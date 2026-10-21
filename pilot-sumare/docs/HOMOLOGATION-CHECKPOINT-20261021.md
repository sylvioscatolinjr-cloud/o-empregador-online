# Homologação do currículo e proteções de IA — 21/10/2026

## Currículo: validação manual do titular

Sylvio informou, no portal de homologação, preenchimento pelo PDF concluído, salvamento executado e dados preservados após atualizar a página. Essa evidência fecha o roteiro manual de importação/aplicação/salvamento/reabertura realizado pelo titular no Chrome habitual. O agente não observou esse fluxo diretamente; a automação permaneceu bloqueada após autenticação protegida. Não equivale a validação de aparelho móvel, OCR, DOCX ou de todas as possíveis estruturas de PDF. Testes locais e SQL hospedados anteriores permanecem evidências separadas.

## Proteções verificadas na versão hospedada

Origem: branch feature/oeo-ai-agents, alias de homologação com Supabase xxirjbsbfxwzplrcbbjt. Requisições HTTP diretas sem autenticação, sem uso de credenciais pessoais, sem executar navegador alternativo ou contornar a proteção de credenciais.

- GET catálogo sem login: 401.
- GET saldo sem login: 401.
- POST execução com origem correta mas sem login: 401.
- POST execução com origem externa: 403.
- GET execução (método indevido): 405.
- Todas as respostas anteriores com Cache-Control no-store.
- GET configuração: ready=true, cadastro público fechado, Supabase de homologação correto.

Seis verificações aprovadas. Não houve chamada a OpenAI, débito de carteira, pagamento Asaas, publicação de dados ou alteração da produção. Esses checks não substituem nova execução real de tarefa guiada com plano e saldo, nem homologação comercial. A conta pessoal de teste tinha 98 centavos na verificação anterior, insuficientes para execução de R$1; não foi recarregada.

## Próximas verificações

Execução de tarefas guiadas após seleção com plano/saldo elegíveis; débito e estorno em falha; upgrade efetivo por perfil/nível. Testes unitários existentes cobrem esses bloqueios, mas o fluxo real completo das tarefas novas continua pendente. Login e recuperação confirmados; pagamento real pelo proprietário e conciliação Asaas antes de abertura comercial permanecem pendentes. Não habilitar cobrança ou publicar no domínio oficial para substituir homologação.

Privacidade: nenhum dado pessoal do PDF foi lido, copiado ao relatório ou enviado à IA nesta etapa. Roteiro pessoal executado pelo titular e apenas resultado funcional registrado. Hipóteses, finalidade de teste, minimização, controles e riscos seguem AUTH-RECOVERY-HOMOLOGATION.md e AI-TASKS.md. Sem novo fornecedor, mudança de retenção, permissão ou alegação de conformidade jurídica integral.
