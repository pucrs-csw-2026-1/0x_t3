# ADR-0004: Biblioteca de gráficos — MUI X Charts

**Status:** Aceito
**Criado em:** 2026-07-05
**Autor:** Grupo 0x

## Contexto

**Produto:** um dashboard de métricas — séries históricas, distribuições
demográficas, counters e comparativos de engajamento.

**Necessidade:** uma biblioteca de visualização de dados que se integre ao
design system (Material Design/MUI, `DESIGN.md`) **sem introduzir uma segunda
linguagem visual**.

## Decisão

Usar **MUI X Charts** (`@mui/x-charts`) como biblioteca padrão de gráficos.

- Consome o mesmo `ThemeProvider`/paleta do MUI já usado no app — cores,
  tipografia e bordas saem do tema, sem reconfiguração manual por gráfico.
- Cobre os tipos necessários para as métricas do T2: `LineChart` (séries
  históricas), `BarChart` (comparativos por evento), `PieChart` (distribuições
  demográficas), `SparkLineChart` (mini-tendências em cards de counter).
- É um pacote MUI oficial → curva de aprendizado baixa para a equipe e
  consistência de acessibilidade/responsividade com o restante da UI.

Gráficos ficam em componentes reutilizáveis (`src/components/charts/`) que
recebem dados já normalizados pela camada de serviço
([ADR-0003](0003-integracao-apis-t1-t2.md)) — nunca fazem fetch.

## Consequências

**Positivas**
- Zero design system extra; cores e fontes derivam do tema Eloo.
- Integração natural com `sx`, breakpoints e tema do MUI.
- Um único vocabulário de componentes para toda a UI (Material Design).

**Negativas / trade-offs**
- Tipos de gráfico muito avançados/exóticos são mais limitados que em
  ECharts/Nivo — aceitável para o escopo de métricas atual.
- Adiciona `@mui/x-charts` ao bundle; se vier a ser `shared` com o shell,
  precisa ser declarado nos dois lados.

## Alternativas consideradas

- **Recharts** — leve e popular, mas design próprio; exigiria alinhar cores ao
  tema manualmente em cada gráfico.
- **Nivo / ECharts** — mais tipos de gráfico e customização, ao custo de
  bundle maior, curva de aprendizado e uma linguagem visual fora do Material
  Design.
