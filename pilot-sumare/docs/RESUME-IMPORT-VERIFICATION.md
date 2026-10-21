# Verificação de importação e formulário — 21/10/2026

Executado leitor real local com o PDF autorizado pelo responsável. Uma página, sem OCR; seções de experiência, formação, competências, certificações e CAI separadas. Conteúdo pessoal e arquivo não copiados para fixtures ou repositório, nem enviados ao modelo ou banco.

Novo teste DOM com texto fictício percorre botão Preencher pelo upload, prévia dos campos, seleção explícita, Aplicar, leitura dos valores do wizard e reconstrução do formulário. Leitor é substituído por fonte de texto determinística neste teste DOM; leitura real do PDF é testada separadamente. Campos existentes não são substituídos por padrão; seleções são respeitadas; graduação/CAI ficam em seções distintas; reabertura não duplica; escolhas de compartilhamento continuam desmarcadas; upload não ocorre na leitura/aplicação, somente quando o fluxo de salvamento solicita attachment(). Não se trata de sessão Chrome com formulário completo.

Teste PGlite existente confirmou persistência de campos privados, isolamento de leitura, rejeição de imagem ativa e snapshot de candidatura que só inclui contatos/foto quando selecionados. É banco PostgreSQL local, não gravação real pela UI hospedada.

Bateria completa com RESUME_TEST_PDF: 154 testes aprovados, zero falhas, zero ignorados. Novo teste não altera comportamento de produção. Painel de tarefas anterior permanece na prévia, commit 915b0d4b5511a3789d7b2670dc50b8de623fbe4a, deployment dpl_86MrkLJ7rV9RxAEtcA9y3WKFjjtv READY. Navegador confirmou nível1, tarefa de revisão disponível, níveis2/3 bloqueados, instruções após seleção e execução bloqueada com saldo insuficiente; largura320 sem transbordamento.

Pendências reais: formulário completo com sessão no ambiente de homologação, salvar/reabrir via navegador hospedado; confirmação/recuperação e entrega de email; aparelho físico/teclado virtual; pagamento real e conciliação com Asaas antes de abertura comercial. Cadastro geral da prévia continua fechado e PILOT_EMAIL_ENABLED=false; não alterar essa flag apenas para encobrir testes pendentes. Não marcar plataforma integralmente homologada.

Privacidade: propósito limitado a leitura e classificação/revisão solicitadas; somente arquivo autorizado local e dados sintéticos nas gravações. Nenhuma nova finalidade ou compartilhamento. Teste não muda retenção ou bases do tratamento do portal. Orientações LGPD/ANPD consultadas na etapa corrente em fontes oficiais registradas em AI-TASKS.md; acesso mínimo, escolha de compartilhamento e segregação preservados. Não há certificação de conformidade jurídica.


## Ensaio hospedado de gravação — 21/10/2026

Executado no projeto isolado xxirjbsbfxwzplrcbbjt com conta candidata, organização e anúncios sintéticos dentro de BEGIN/ROLLBACK. O roteiro antigo pressupunha logo público após upload e falhou com Logo not persisted: requisito obsoleto após migração de consentimento de imagem. Ajustado para primeiro exigir logo ausente, depois marcar show_card_image=true. Nenhuma regra da aplicação ou política foi relaxada.

Resultado final: Private structured resume, opt-in snapshot, organization logo and removal verified; fixtures rolled back. Confirmados: gravação de resume_details/foto, candidatura sem contatos/foto quando não escolhidos, candidatura com dados selecionados, organização sem leitura direta do perfil privado, logo visível somente após escolha e remoção sincronizada. Consulta posterior contou zero contas wizard-probe no Auth. Sem email, dado real do PDF, chamada a IA ou pagamento externo.

Essa etapa é SQL hospedado sob papel authenticated e identidade de teste; não equivale a salvar/reabrir pela interface Chrome. app/app.mjs permanece dependente de config.ready; a prévia mantém ready=false por PILOT_EMAIL_ENABLED=false, enquanto somente a entrada de IA tem configuração restrita separada. Não ligar envio de email ou ampliar o acesso para substituir a validação de entrega/recuperação. Regras e referências de privacidade anteriores continuam aplicáveis.
