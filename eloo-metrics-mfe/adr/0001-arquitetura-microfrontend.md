# ADR-0001: Arquitetura de microfrontend via Module Federation

**Status:** Aceito **Criado em:** 2026-07-05 **Autor:** Grupo 0x

## Contexto

**Plataforma:** a Eloo é composta por aplicações frontend independentes montadas em runtime por uma aplicação _host_ (`eloo-shell`) usando **Module Federation** (`@originjs/vite-plugin-federation`).

- **Precedente:** já existe um remote de autenticação (`eloo-auth-mfe`, remote `mfeAuth`) consumido pelo shell.
- **O que é o T3:** a interface de **métricas/analytics** de eventos do Grupo 0x, que consome o Metrics Service (T2, `0x_t2`).
- **Decisão em aberto:** se essa interface será uma aplicação isolada, uma página dentro do shell, ou um novo microfrontend federado.

## Decisão

O `eloo-metrics-mfe` será um **microfrontend remote** federado, seguindo o mesmo padrão de `eloo-auth-mfe`:

- Configurado com `vite-plugin-federation` em modo **remote**, com `federation({ name: "mfeMetrics", filename: "remoteEntry.js", exposes: {...} })`.
- Expõe páginas de dashboard como módulos remotos consumidos pelo `eloo-shell` como `mfeMetrics/<NomeDaPagina>`.
- Roda **standalone** em desenvolvimento (dev server próprio) e como **remote buildado** (`serve:remote`) para o shell consumir.
- Declara como `shared` os singletons `react`, `react-dom`, `react-router-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled` — idênticos aos do shell e do `mfe-auth`, para haver **uma única cópia** em runtime e o `ThemeProvider` funcionar através da fronteira de federação.
- **Versionamento:** o código do T3 vive na pasta `eloo-metrics-mfe/` do repositório raiz **`0x_t3`** (GitHub: `pucrs-csw-2026-1/0x_t3`), que é a referência de git do trabalho. O deploy do remote é independente do shell e dos demais remotes (build/preview próprios), mas o versionamento é feito no repositório raiz.

### Portas

Para não colidir com os serviços já existentes (shell 5173, mfe-auth 5174/5175):

| Uso                                  | Porta |
| ------------------------------------ | ----- |
| Dev standalone (`npm run dev`)       | 5177  |
| Preview como remote (`serve:remote`) | 5176  |

O shell registra o remote em `src/shell/remotes.ts` apontando para `http://localhost:5176/assets/remoteEntry.js`.

## Consequências

**Positivas**

- Deploy e evolução independentes; a equipe de métricas não bloqueia nem é bloqueada pelas demais.
- Consistência com o ecossistema Eloo — o shell integra o remote com o mesmo fluxo já documentado em `eloo-shell/README.md`.
- Isolamento de falhas: o shell monta o remote via `RemoteSlot` (Suspense + error boundary), então um remote lento/quebrado não derruba o restante.

**Negativas / trade-offs**

- Toda dependência `shared` nova precisa ser adicionada **nos dois lados** (remote e shell) sob pena de duplicar React/Emotion em runtime.
- Module Federation resolve remotes em runtime; o TypeScript não enxerga através da fronteira, exigindo declarações ambientais no shell (`vite-env.d.ts`).

## Alternativas consideradas

- **Página dentro do `eloo-shell`** — descartada: acopla o ciclo de release de métricas ao do host e foge do padrão de microfrontends já adotado.
- **SPA totalmente separada (sem federação)** — descartada: perderia a navegação/tema unificados do shell e a experiência integrada da plataforma.
