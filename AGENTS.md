# Continuidade — O Empregador Online

Antes de qualquer alteração, leia `PROJECT_REQUIREMENTS.md` e os documentos referenciados relevantes. O usuário exige preservar decisões e recursos anteriores; toda atualização é incremental. Compare produção com protótipo e mantenha estados honestos: demonstrado não significa integrado.

Produção é `pilot-sumare/` (Vercel/Supabase). O projeto raiz/Sites guarda o protótipo e a fonte: não publicar o Worker raiz no domínio do portal real. Preserve logo, separação de perfis, RLS, dados privados, carrosséis fixos de 5 s com controles, demo Fictício e PWA. Não ligar cobranças ou publicação automática para preencher lacunas.

Atualize o inventário quando concluir uma integração. Teste mudança e fluxos afetados antes de publicar. Não declarar que todas as funções estão prontas enquanto houver pendências reais.

Em toda alteração ou implantação, revisar o histórico disponível e consultar a LGPD vigente e orientações pertinentes da ANPD em fontes oficiais. Registrar finalidade, dados mínimos, hipótese legal aplicável, transparência, acesso, retenção/direitos e riscos; ajustar pedidos incompatíveis antes de implementar. Não declarar conformidade jurídica completa por passar testes técnicos. Convites de equipe de empresa/instituição exigem CPF exato informado para essa finalidade, sem diretório de candidatos; pendente até aceite exclusivo do destinatário, depois Conectado.

Novos botões, links de ação e recursos devem reutilizar o mesmo padrão visual dos controles vizinhos (tipografia, borda, fundo, dimensões, espaçamento, foco e hover). Em menus mistos, links de navegação recebem a aparência compartilhada dos botões, preservando sua semântica e responsividade.

Links com função de botão comum devem usar a classe compartilhada `portal-action`, que herda o estilo base dos botões. Em grupos `.actions`, preserve também altura, alinhamento, quebra de texto e comportamento móvel. Não apresentar novos atalhos administrativos como links textuais sem esse padrão.

Exceção expressamente autorizada em 23/10/2026: modo de teste dos planos somente para o ID Auth configurado em OEO_OWNER_TEST_USER_ID, após confirmar papel pilot_owner ativo/não fictício na turma do servidor. Libera agentes e treinamentos dos três perfis, sem mudar membership, plano, preços ou carteira. IA administrativa usa quota própria de 60 tentativas/dia, sem crédito ou pagamento sintético. Nunca estender por e-mail, metadados do navegador ou papel informado pelo cliente, nem apresentar esse acesso como assinatura paga na vitrine. Ver pilot-sumare/docs/OWNER-ALL-PLAN-TESTING.md.

Nova regra comercial autorizada em 23/10/2026: IA do próprio perfil liberada em todos os planos, com 18 tarefas guiadas + agente livre e execução normal de R$ 1,00 em saldo. Recargas avulsas de R$ 10/25/50 independentes da assinatura; não conceder nível ou prioridade com recarga. Créditos do plano mantêm validade/percentuais; recargas não expiram. Exceção de teste do proprietário permanece. Ver pilot-sumare/docs/HYBRID-AI-WALLET.md. Contratação pública de assinaturas mantém validação anterior; abertura de recargas foi expressamente autorizada.
