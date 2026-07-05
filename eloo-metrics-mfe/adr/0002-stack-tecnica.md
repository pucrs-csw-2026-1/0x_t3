# ADR-0002: Stack técnica (Vite + React + TypeScript + MUI + Tailwind)

**Status:** Aceito
**Criado em:** 2026-07-05
**Autor:** Grupo 0x

## Contexto

**Necessidade:** o `eloo-metrics-mfe` precisa de uma stack de frontend coerente
com o restante da plataforma Eloo. Dois motivos:

- **Federação de módulos funcionar:** dependências `shared` idênticas às do
  shell e do `mfe-auth`.
- **Reaproveitar o design system já definido:** `DESIGN.md` (Material Design,
  MUI, Tailwind, tokens de cor/tipografia).

## Decisão

Adotar **exatamente a mesma stack** do `eloo-auth-mfe` e do `eloo-shell`:

| Camada                     | Tecnologia                                      | Versão de referência                        |
| -------------------------- | ----------------------------------------------- | ------------------------------------------- |
| Build/dev                  | **Vite**                                        | ^5.4                                        |
| UI runtime                 | **React** + **React DOM**                       | ^18.3                                       |
| Linguagem                  | **TypeScript**                                  | ^5.6                                        |
| Componentes                | **MUI (Material UI)** + **@mui/icons-material** | ^6.1                                        |
| Estilização de baixo nível | **TailwindCSS**                                 | ^3.4                                        |
| CSS-in-JS (peer do MUI)    | **@emotion/react** + **@emotion/styled**        | ^11                                         |
| Roteamento                 | **react-router-dom**                            | ^6.27                                       |
| Federação                  | **@originjs/vite-plugin-federation**            | ^1.3                                        |
| Gráficos                   | **@mui/x-charts**                               | ver [ADR-0004](0004-biblioteca-graficos.md) |

**Divisão de responsabilidades de estilo:**

- **MUI** para componentes, tema e tokens semânticos (`ThemeProvider`,
  paleta, tipografia) — fonte de verdade do visual, alinhado ao Material Design.
- **Tailwind** para _layout utilitário_ (espaçamento, flex/grid,
  posicionamento, efeitos decorativos), como já é feito no `mfe-auth`
  (ex.: `className="flex flex-col gap-6"`). Os tokens do Tailwind
  (`tailwind.config.js`) espelham os do `DESIGN.md`.

**Tema:** replicar o padrão de `eloo-auth-mfe/src/theme.ts` — um tema MUI
próprio usado quando o app roda standalone, e o tema do shell (recebido via
prop `theme`) quando montado como remote (ver [ADR-0005](0005-contrato-paginas-remote.md)).

## Consequências

**Positivas**

- Federação funciona sem duplicar singletons (mesmas versões `shared`).
- Design consistente com o resto da Eloo sem reinventar tokens.
- Curva de aprendizado zero para quem já trabalhou no `mfe-auth`.

**Negativas / trade-offs**

- Manter as versões `shared` **sincronizadas** com o shell é obrigatório;
  divergência de major de React/MUI/Emotion quebra a federação.
- Coexistência MUI + Tailwind exige disciplina para não haver conflito de
  estilos (regra: Tailwind não sobrescreve o que o tema MUI controla).

## Alternativas consideradas

- **Trocar MUI por outra lib de componentes** — descartada: fere o `DESIGN.md`
  (Material Design/MUI) e a coerência da plataforma.
- **Abandonar Tailwind e usar só `sx`/Emotion** — descartada: o padrão vigente
  do `mfe-auth` usa Tailwind para layout; manter consistência.
- **CRA / Webpack** — descartada: o ecossistema já é Vite; Module Federation
  está configurado via `vite-plugin-federation`.
