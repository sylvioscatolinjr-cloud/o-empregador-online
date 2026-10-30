# Revisão da conta candidata — 30/10/2026

## Correções

- Lista privada de cursos direciona para `/assinatura.html`; sandbox permanece exclusivo do proprietário. O link Meu Espaço retorna à conta.
- O tratador de envio da conta só recebe seus formulários. Nebu mantém seu próprio fluxo e mensagens. O estado transitório Processando é encerrado ao finalizar; erros e confirmações permanecem visíveis. Propostas de entrevista são encaminhadas ao tratador existente.
- A carteira encerra Conectando tanto no sucesso quanto na falha, com erro acessível.
- Detalhes consultam favoritos privados antes de desenhar a estrela, inclusive acesso direto.
- Convite de entrevista e etapas têm mensagens distintas. Data de etapa não implica convite enviado ou aceito; nenhum evento é criado ou confirmado por esta revisão.
- Carteira e planos informam pesquisa padrão R$2,50/ampliada R$5,00, iguais à tela de autorização e aos Termos vigentes. Nenhuma mudança de preço ou cobrança.
- Leitura local reconhece tabelas por geometria, mantém células, palavras quebradas, idiomas com níveis e atividades em largura total. A leitura de duas colunas e OCR continua coberta pelos testes. Cidade/UF duplicadas são normalizadas na apresentação e ao salvar, somente quando o sufixo coincide com a UF.
- Preferências de campanha explicam ausência de maioridade confirmada e oferecem atendimento. Nenhuma inferência de idade pelo currículo nem ativação de consentimento.

## Dados e limites

Finalidade: permitir manutenção do currículo e utilização correta dos recursos já solicitados pelo titular. Dados mínimos: mesmos campos de currículo, favoritos, interesses e situação da conta, com acesso autenticado e regras existentes; leitura do arquivo permanece no aparelho. Hipótese aplicável ao currículo/conta: execução do serviço a pedido do titular (art.7º,V), mantendo consentimentos específicos de compartilhamento e campanhas quando aplicáveis. Esta revisão não amplia finalidades, fornecedores, público, retenção ou acesso. Arquivo original e cópias já enviadas não são substituídos automaticamente; não há migração em lote nem enriquecimento de qualificações. Trechos incertos exigem revisão e podem ficar sem classificação. Campos continuam editáveis; direitos e canal de atendimento existentes preservados.

Consulta em30/10: LGPD compilada disponível em https://normas.leg.br/?urn=urn:lex:br:federal:lei:2018-08-14;13709 e orientação ANPD sobre finalidade, necessidade, qualidade e transparência em https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/glossario-anpd/p . Não constitui certificação jurídica integral.

## Validação

532 testes aprovados, zero falhas; um teste opcional de PDF privado ignorado pela suíte e anexo conferido separadamente. Build local aprovado. Testes de UI de candidato, favoritos, agenda, assinatura, carteira e navegação; tabela sintética com competências quebradas e idiomas em duas páginas; extração real PDF/DOCX, duas colunas e OCR local, sem chamada paga. Conferência adicional do anexo original autorizada para diagnosticar a falha; nenhum dado pessoal é incluído nos fixtures ou neste documento. Publicação segue branch, PR, prévia Vercel e merge. Testes não criam candidatura, compra ou campanha real.

Limites: uma mensagem livre do recrutador não cria convite de agenda; só a organização pode propor o horário nesse recurso. Conteúdo importado deve ser revisado. Abertura de PDF em nova aba é comportamento normal; não depende de um evento de download.
