> Atualização: destaques agora têm rotação automática a cada 5 segundos, pausa/retomada e setas. Navegação manual pausa a rotação. Interação com cards, detalhes abertos e aba oculta suspendem as trocas. Redução de movimento inicia pausado. Favoritos são atualizados sem reconstruir a página, com estrela dourada e persistência no espaço privado. Rotação automática não grava no servidor nem movimenta os resultados orgânicos; anúncios promovidos ficam nas prateleiras de destaque. Distribuição de campanhas e contagem de impressões de produção continuam pendentes.

# Destaques e impulsionamento

## Implementado nesta demonstração

- Botão de impulsionamento destacado nos três perfis e em cada publicação local.
- Campanhas de teste por conteúdo e duração, sem cobrança.
- Currículo próprio só entra no catálogo de teste após nome, objetivo e competências preenchidos e visibilidade para recrutadores selecionada. Não expor e-mail, CPF ou arquivo de currículo na vitrine.
- Três vitrines: vagas, formação (cursos/treinamentos), currículos. Até três cards por categoria, navegação manual, identificação de patrocinado.
- Um conteúdo por anunciante em cada rodada da categoria; sobras não são preenchidas com mais conteúdos da mesma organização.
- Resultados paginados em até 12 cards, além das vitrines. Não repetir o mesmo conteúdo da vitrine na página de resultados.
- Busca restringe a vitrine aos registros relacionados aos filtros de tipo, cidade e texto.
- Modo de teste com 1.000 registros fictícios por categoria (3.000 ao todo).
- O rodízio é local; mudar os cards não representa impressões reais, pessoas diferentes ou alcance externo. Os planos não alteram o rodízio nesta versão.

## Alocação real recomendada

1. Selecionar campanhas ativas e autorizadas para a categoria, localização, contexto e competências relevantes.
2. Reservar poucos slots de destaque. Manter o restante dos resultados paginado e acessível por filtros.
3. Distribuir exposição usando fila ponderada por déficit. Inicialmente, usar pesos a validar (por exemplo, 1/2/3), sem prioridade estrita que deixe planos menores sem nenhuma oportunidade.
4. Dentro de cada faixa relevante, calcular uma meta proporcional à participação da campanha e escolher as que estão mais abaixo dessa meta. Registrar decisões no servidor. Uma campanha nova não herda um déficit ilimitado desde o início da plataforma: sua meta começa na ativação.
5. Limitar repetição por visitante e concentração por organização. Medir anúncios por organização, não apenas por anúncio, para evitar monopolizar exposição criando muitos anúncios.
6. Contar impressão quando o card estiver efetivamente visível por uma condição verificável (por exemplo, pelo menos 50% do card durante 1 segundo); deduplicar eventos, retirar tráfego automatizado e medir cliques separadamente. Esses parâmetros precisam ser validados e documentados antes da venda.
7. Evitar trocas automáticas que interrompam leitura. Atualizar lotes entre visitas/navegações; setas permitem explorar mais opções.
8. Mostrar ao anunciante impressões, cliques, contexto, período e desempenho. Não confundir rodada de navegador com impressão real.
9. Monitorar capacidade por segmento. Não prometer mínimo de impressões sem estimar inventário, reservar a capacidade correspondente e definir compensação para entrega insuficiente. Quando houver excesso de demanda, limitar vendas, oferecer outra região/período ou ajustar o pacote com condições explícitas.

## Planos e créditos

A assinatura pode oferecer créditos de impulsionamento, limites e peso de distribuição superior. Impulsionamento avulso deve ter regras compatíveis com assinatura. Não somar pesos sem limite. Quem paga mais recebe uma parcela de exposição maior entre resultados compatíveis, sem excluir quem paga menos.

A garantia possível não é que todos os visitantes verão todos os anúncios. É uma regra transparente de distribuição e, se vendido, um volume contratado de entrega cuja capacidade foi reservada.

## Segurança

Ativação, duração, pagamento, titularidade e autorização de gastos devem ser verificados no servidor. Um membro sem permissão de faturamento pode abrir a oferta, mas precisa da autorização pontual do responsável para ativar uma campanha paga. O protótipo apenas simula esse controle.
