# ADR-0012: Empacotamento Docker, docker-compose e pipeline de deploy (CD) do T3

**Status:** Aceito **Criado em:** 2026-07-07 **Autor:** Grupo 0x

## Contexto

Até agora o `eloo-metrics-mfe` (T3) só roda via **npm** (`npm run dev` standalone ou `npm run serve:remote` como remote), enquanto os backends T1/T2 já sobem via `docker compose` e têm pipeline de CD ([`0x_t2/.github/workflows/cd.yml`](../../0x_t2/.github/workflows/cd.yml)). Falta ao T3:

- uma **imagem Docker** e um **docker-compose** para subir o remote sem `npm` na máquina de quem recebe;
- um **pipeline de deploy (CD)** espelhando o padrão dos repositórios irmãos (build via `docker compose` + release beta).

O `0x_t3` já tem CI ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml): lint, typecheck, test, e2e mock, build), mas nenhum Dockerfile/compose/CD.

## Decisão

### 1. Escopo do compose: só o T3

O `docker-compose.yml` (na **raiz do `0x_t3`**, espelhando o "compose da raiz" do T2) sobe **apenas** o remote de métricas (`eloo-metrics-mfe`) na porta **`:5176`**. Os backends T1 (`:8080`) e T2 (`:8000`), o shell e o remote de auth continuam à parte (host ou seus próprios composes) — o T3 é uma peça independente (ADR-0001). O proxy do Vite alcança os backends via `host.docker.internal`, configurável por env (`METRICS_SERVICE_URL`/`AUTH_SERVICE_URL`).

### 2. Imagem: build + `vite preview`

`Dockerfile` **multi-stage**: um estágio builda o app (`npm ci` + `npm run build`, gerando o `remoteEntry.js`) e outro serve com **`vite preview --host --port 5176`** — o mesmo runtime do `npm run serve:remote`. Isso **reusa o proxy do `vite.config.ts`** (`/api`→T2, `/auth-api`→T1, contorno de CORS — ADR-0003) sem escrever um `nginx.conf` à parte.

- Trade-off assumido: `vite preview` **não é um servidor de produção** — é aceitável para o **MVP/beta** da disciplina (o próprio T2 é publicado como beta). Migrar para nginx estático + `proxy_pass` é um ADR futuro se/quando "produção real" entrar em escopo.

### 3. Pipeline de deploy (CD): espelha o T2

Novo workflow `.github/workflows/cd.yml`, disparado no **push para `main`**, reproduzindo o [`cd.yml` do T2](../../0x_t2/.github/workflows/cd.yml):

1. Roda os gates (lint + typecheck + test com cobertura ≥80%) — mesmos do CI.
2. **Build de todas as imagens via `docker compose build`** a partir da raiz — garante que `docker compose up` funciona para quem recebe.
3. Publica um **release beta idempotente** (não recria a tag se já existe). **Sem push para registry** (alinhado ao CONTRIBUTING/T2): o pipeline valida o build, não hospeda imagem.

### 4. Enquadramento

Esta decisão é uma **US própria** (US-10 — deploy Docker), separada da US-09 (documentação). Alterações em CI/CD e infra seguem as regras de decisão do usuário (CLAUDE.md §1).

## Consequências

**Positivas**

- `docker compose up` sobe o remote do T3 sem `npm` local — reprodutível.
- CD consistente com T1/T2 (mesmo padrão de gates + build + release beta).
- Reuso integral do proxy do `vite.config` — zero duplicação de configuração de rede.

**Negativas / trade-offs**

- `vite preview` não é production-grade (aceitável no MVP; nginx seria ADR futuro).
- O compose "só T3" não sobe backends: quem quer o fluxo ponta-a-ponta ainda sobe T1/T2 (e shell/auth) separadamente. `host.docker.internal` cobre o acesso do container aos backends do host.
- A imagem carrega `node_modules` (dev deps) para o `vite preview` — maior que uma imagem nginx estática.

## Alternativas consideradas

- **nginx estático servindo `dist/`** — descartada nesta fase: exigiria manter um `nginx.conf` com `proxy_pass` replicando o proxy do Vite; overhead sem ganho no MVP.
- **Compose do stack inteiro (frontend + T1 + T2)** — descartada: acopla repositórios e foge do escopo "deploy do T3"; cada serviço tem seu próprio compose.
- **Push da imagem para o GHCR** — descartada nesta fase: alinhado ao T2, o CD valida o build sem hospedar imagem (sem registry).
- **Adicionar só o build ao `ci.yml`** — descartada: o grupo mantém CI (todo push/PR) e CD (release na `main`) separados, como em T1/T2.
