> Atualização da versão 8: veja UPDATE_V8.md para o comportamento atual. A persistência do espaço privado e arquivos está no servidor; os fluxos comerciais multiusuário continuam demonstrativos. A ocultação do nome agora independe do plano do candidato.

# Minha Carreira

## Protótipo

Área exclusiva da interface do candidato, separada do currículo público e do catálogo de recrutamento. Histórico permanece neste navegador. Não existe proteção de dados pessoais no servidor ainda; manter a publicação privada e usar dados de teste.

Vínculos possuem empresa, data de admissão, data de saída opcional, cargo inicial, salário mensal bruto e nível pessoal de responsabilidade de 1 a 5. Cada vínculo aceita promoções, mudanças de cargo e reajustes com data, cargo, salário total após a mudança, nível e observações. Registros podem ser editados; datas são conferidas contra o período do vínculo. Não inserir fatos futuros no histórico.

O gráfico financeiro mostra a soma de salários mensais nominais dos vínculos ativos em cada data de mudança. Vínculos encerrados param de contribuir no dia seguinte à saída. Períodos sem vínculo registrado aparecem como zero. Não representa renda líquida, bônus, benefícios ou poder de compra corrigido pela inflação.

O gráfico de função mostra o maior nível de responsabilidade pessoal entre os vínculos ativos. A escala é uma autoavaliação (inicial, execução orientada, autonomia, liderança, gestão estratégica), não uma hierarquia automática de profissões. Zero indica nenhum vínculo ativo registrado. Não inferir perda de qualificação a partir desse gráfico.

## Meta e planejamento

No portal normal: Meu espaço → Candidato → Metas e plano. O currículo e o panorama de Minha Carreira também exibem um destaque com Definir minha meta ou Editar minha meta e, quando há meta salva, Ver plano de desenvolvimento. O formulário fica na aba Meta profissional; salvar direciona ao plano. O plano tem um botão para editar a meta. Os atalhos são externos ao formulário do currículo e mantêm o upload como primeira opção de preenchimento.

Meta: cargo, empresa desejada opcional, salário mensal bruto, data-alvo, competências exigidas, horas de estudo semanais e orçamento mensal. O histórico não é publicado automaticamente no currículo.

Planejamento atual é por regras, sem IA: compara competências exigidas e declaradas por igualdade normalizada, recomenda até três vagas e três cursos pelo texto de cargo/competências, e permite cadastrar ações com horas, custos e fonte informados pelo candidato. Conteúdos do portal são exemplos, não recomendações baseadas em vagas reais verificadas. Candidaturas continuam simuladas.

Horas ou custos desconhecidos são nulos, não zero. Tempo de estudo = soma das horas / disponibilidade semanal, arredondada para cima. Investimento = soma dos custos informados; exibir subtotal quando faltar algum custo. Meses para financiar = custo / orçamento mensal, arredondado para cima; sem orçamento e com custo positivo, não calcular prazo. Cenário conservador soma financiamento e estudo, usando 4,345 semanas por mês. Não estima quando o candidato será contratado, promovido ou conseguirá o salário desejado.

Verificação: `tests/private-demo.cjs` navega pelos botões do portal normal até o formulário de meta, sem usar o roteiro de testes para esse caminho; cobre menu recolhido, indicação única da seção selecionada, salvamento e abertura do plano, edição e retorno pelo panorama/currículo, persistência, preservação do currículo e ausência dos atalhos nos perfis de organização. `tests/resume-import.cjs` e `tests/pwa-ui.cjs` preservam os fluxos de upload e navegação móvel. A revisão visual em navegador não estava disponível nesta atualização.

## Integração real futura

- Registros pessoais por usuário, criptografia e autorização no servidor. Recrutadores não recebem remuneração histórica, metas ou planos pessoais por padrão.
- Conectar IA somente após autenticação e contratação/configuração suportadas; explicar dados usados e créditos cobrados. Nenhuma chamada a IA está ativa.
- Basear lacunas e recomendações em requisitos reais, dados atualizados e fontes verificáveis. Distinguir certeza, hipótese e informação ausente.
- Obter preço, carga horária, requisitos, datas, certificado e disponibilidade com os ofertantes. Não fabricar custo ou duração.
- Separar prazo de formação, preparação do portfólio, candidatura e contratação. Cálculo de estudo não é promessa de emprego.
- Avaliar progresso por evidências e critérios explícitos; título de cargo isolado não define responsabilidade e salário nominal isolado não mede poder de compra.
