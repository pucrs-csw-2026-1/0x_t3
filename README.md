# Frontend Metrics — Dashboard de Métricas de Eventos

Aplicação web (SPA) que consome a **API do Metrics Service** e apresenta as métricas de eventos (counters, distribuições demográficas, engajamento e séries históricas) em um painel visual. Construída com **React 19**, **TypeScript**, **Vite** e **Tailwind CSS v4**.

> Trabalho da disciplina de **Construção de Software** — PUCRS, 2026/1 · Grupo **0x**.

### Autores — Grupo 0x

- Carlos Eduardo B. Mascarello
- Lucas A. Brentano
- Victória C. Marques

---

## Índice

1. [Tech Stack](#tech-stack)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação](#instalação)
4. [Executando a Aplicação](#executando-a-aplicação)
5. [Scripts Disponíveis](#scripts-disponíveis)
6. [Estrutura do Projeto](#estrutura-do-projeto)
7. [Lint e Tipagem](#lint-e-tipagem)

---

## Tech Stack

| Camada | Tecnologia |
|---|---|
| Biblioteca de UI | [React 19](https://react.dev/) |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Build tool / dev server | [Vite](https://vite.dev/) |
| Estilização | [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`) |
| Linter | [ESLint](https://eslint.org/) + plugins (react-hooks, jsx-a11y, import, simple-import-sort) |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) **20+** (recomendado 22 LTS)
- **npm** (acompanha o Node)

---

## Instalação

Clone o repositório, entre na pasta do frontend e instale as dependências:

```bash
git clone https://github.com/pucrs-csw-2026-1/0x_t3.git
cd 0x_t3/frontend_metrics
npm install
```

> **Nota sobre `peer dependencies`:** alguns plugins do ESLint ainda não declararam suporte oficial ao ESLint 10. Se o `npm install` falhar com erro **`ERESOLVE`**, rode com a flag:
>
> ```bash
> npm install --legacy-peer-deps
> ```

---

## Executando a Aplicação

Suba o servidor de desenvolvimento (com Hot Module Reload):

```bash
npm run dev
```

A aplicação fica disponível em **<http://localhost:5173>** (o Vite imprime a URL no terminal). O servidor recarrega automaticamente ao salvar arquivos em `src/`.

Para gerar o build de produção e pré-visualizá-lo localmente:

```bash
npm run build      # compila TypeScript + gera o bundle otimizado em dist/
npm run preview    # serve o conteúdo de dist/ para conferência
```

---

## Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `npm run dev` | Servidor de desenvolvimento (Vite + HMR) em `:5173` |
| `build` | `npm run build` | Verifica os tipos (`tsc -b`) e gera o build de produção em `dist/` |
| `lint` | `npm run lint` | Roda o ESLint em todo o projeto |
| `preview` | `npm run preview` | Servidor local para pré-visualizar o build de `dist/` |

---

## Estrutura do Projeto

```
frontend_metrics/
├── public/                 # Assets estáticos servidos como estão (ex.: icons.svg)
├── src/
│   ├── assets/             # Imagens importadas pelos componentes (logos, hero)
│   ├── App.tsx             # Componente raiz da aplicação (estilizado com Tailwind)
│   ├── main.tsx            # Ponto de entrada — monta o React no #root
│   └── index.css           # Entrada do Tailwind (@import "tailwindcss")
├── index.html              # HTML base carregado pelo Vite
├── eslint.config.js        # Configuração do ESLint (flat config)
├── vite.config.ts          # Configuração do Vite (plugins React + Tailwind)
├── tsconfig*.json          # Configurações do TypeScript
└── package.json
```

---

## Lint e Tipagem

```bash
# Linter (ESLint) — qualidade, hooks, acessibilidade e ordenação de imports
npm run lint

# Correção automática dos problemas que o ESLint sabe consertar
npx eslint . --fix

# Verificação de tipos sem gerar build
npx tsc --noEmit
```

As regras estão em [`eslint.config.js`](eslint.config.js). A configuração inclui:

- **typescript-eslint** — boas práticas de TypeScript;
- **react-hooks** / **react-refresh** — uso correto de hooks e compatibilidade com HMR;
- **jsx-a11y** — acessibilidade no JSX;
- **import** + **simple-import-sort** — validação e ordenação automática dos imports.
