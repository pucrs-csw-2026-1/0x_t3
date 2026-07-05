# ADR-0005: Contrato de páginas remote e internacionalização (pt-BR)

**Status:** Aceito
**Criado em:** 2026-07-05
**Autor:** Grupo 0x

## Contexto

**Montagem:** como remote de Module Federation
([ADR-0001](0001-arquitetura-microfrontend.md)), cada página exposta é montada
dentro da página do shell — que tem seu próprio router e tema.

- **Contrato do host:** o `eloo-shell/README.md` define um contrato que todo
  remote da Eloo deve seguir.
- **Adesão obrigatória:** o `eloo-metrics-mfe` precisa aderir a ele para ser
  montável sem acoplamento.

## Decisão

Toda página exposta segue **o mesmo contrato do `eloo-auth-mfe`**:

1. **Prop `theme?: Theme`** — a página envolve sua árvore em
   `<ThemeProvider theme={theme ?? defaultTheme}>`. Recebe o tema do shell
   quando montada como remote; cai no tema próprio (`src/theme.ts`) quando roda
   standalone.
2. **Callbacks em vez de navegação interna** — a página **não** navega
   sozinha. Reporta ações para cima via props (`onSelectEvent`,
   `onExport`, `onNavigateBack`, ...). O host decide o que cada ação significa
   na sua própria rota (via `useNavigate`).
3. **Sem estado global próprio de sessão** — token/perfil vêm do storage
   compartilhado (`mfeAuth.*`); a expiração de sessão é sinalizada pelo evento
   `mfeAuth:sessionExpired`, tratado pelo host.
4. **Proteção de rota é do host** — a página assume que só é montada para um
   usuário autenticado/autorizado; a guarda (ex.: `RequireManager`) fica no
   shell, não dentro do remote.
5. **Exposição** — cada página vira uma entrada em
   `federation({ exposes: { "./NomePage": "./src/pages/NomePage.tsx" } })`, e
   o shell declara o tipo ambiental correspondente em `vite-env.d.ts`.

### Internacionalização

- **Todo texto visível ao usuário é em português (pt-BR)**, conforme a regra do
  `DESIGN.md` ("All labels and content should be written in Portuguese").
- Formatação de números, datas e percentuais usa `Intl` com locale `pt-BR`
  (ex.: separador de milhar, `%`, datas `dd/mm/aaaa`).
- Mensagens de erro traduzidas na camada de serviço, nunca expondo texto cru do
  backend.

## Consequências

**Positivas**
- Remote plugável no shell sem alterar o host além do registro documentado.
- Páginas testáveis isoladamente (standalone) com tema próprio.
- Experiência de usuário consistente e localizada.

**Negativas / trade-offs**
- Exige disciplina: qualquer `useNavigate` dentro de uma página exposta é uma
  violação do contrato (verificado pelo subagent `architecture-guard`).

## Alternativas consideradas

- **Remote navega sozinho com seu próprio router** — descartada: quebra a
  navegação unificada do shell e duplica roteamento.
- **Textos em inglês / i18n multi-idioma** — descartada nesta fase: o
  `DESIGN.md` fixa português; multi-idioma seria escopo/ADR futuro.
