# ADR-0003: Integração com as APIs T1 (auth) e T2 (metrics)

**Status:** Aceito **Criado em:** 2026-07-05 **Autor:** Grupo 0x

## Contexto

O critério de avaliação **Integração com APIs (T1/T2) — 25%** exige integração sólida com **duas** APIs:

- **T1 — Auth Service** (`0x_t1`, `ms-auth` local, porta `8080`): OAuth2 + JWT, cadastro/login, perfil de usuário, RBAC. Já é consumido pelo `eloo-auth-mfe`.
- **T2 — Metrics Service** (`0x_t2`, `ms-metrics` local): API **read-mostly** de analytics (counters por evento, distribuições demográficas, engajamento, horas de participação, séries históricas). Valida o JWT do usuário via **JWKS** do Auth (resource server) e aplica **RBAC** (ADR-0002 do T2).

**Restrição de CORS:** ambos os backends podem **não enviar headers CORS**, exatamente como `ms-auth`/`ms-event` no restante da plataforma — chamadas diretas do browser seriam bloqueadas.

## Decisão

### 1. Camada de serviço isolada

Todo acesso a rede fica em `src/services/`:

- `authApi.ts` — **reaproveita o padrão de `eloo-auth-mfe`**: login, perfil, armazenamento/validação de tokens e o evento `sessionExpired`. Não reimplementar autenticação.
- `metricsApi.ts` — **único** ponto que fala com o Metrics Service (T2). Mapeia snake_case ↔ camelCase, tipa os DTOs de métricas e centraliza o tratamento de erro/carregamento.

Nenhum componente faz `fetch` direto — sempre via a camada de serviço.

### 2. Origem própria + proxy server-to-server (contorno de CORS)

Requisições vão para `/api` na **própria origem** do app, resolvida via `new URL(import.meta.url).origin` (não caminho relativo — assim continua correto quando o módulo roda dentro da página do shell). O `vite.config.ts` faz o proxy server-to-server para o backend, como em `eloo-auth-mfe/vite.config.ts`:

```ts
proxy: {
  "/api":       { target: env.METRICS_SERVICE_URL || "http://localhost:8000", changeOrigin: true, rewrite: p => p.replace(/^\/api/, "") },
  "/auth-api":  { target: env.AUTH_SERVICE_URL    || "http://localhost:8080", changeOrigin: true, rewrite: p => p.replace(/^\/auth-api/, "") },
}
```

URLs configuráveis por `.env` (`METRICS_SERVICE_URL`, `AUTH_SERVICE_URL`).

### 3. Autenticação e autorização

- O usuário se autentica pelo remote de auth (T1); o token de acesso é lido do storage (`mfeAuth.accessToken`) — a mesma chave usada pelo `mfe-auth`.
- Toda chamada ao Metrics Service envia `Authorization: Bearer <accessToken>`.
- **Telas de métricas são protegidas:** sem token válido, não renderizam dados — o shell redireciona para login (guarda de rota no host; ver [ADR-0005](0005-contrato-paginas-remote.md)).
- RBAC do T2 é respeitado: um `403` do backend vira mensagem "sem permissão", não um erro genérico.

### 4. Tratamento consistente de estados (exigência da rubrica)

Toda página de dados trata explicitamente:

- **loading** — skeleton/`CircularProgress` enquanto carrega.
- **erro de requisição** — `Alert` com mensagem em português + ação de "tentar novamente".
- **sessão expirada** — `401` limpa tokens e dispara o evento `mfeAuth:sessionExpired` (mesmo mecanismo do `mfe-auth`); o host redireciona para `/login`.
- **vazio** — estado "sem dados para o período/filtro selecionado".

## Consequências

**Positivas**

- Integração T1 **e** T2 explícita e testável, atendendo diretamente ao critério de 25%.
- CORS resolvido pelo mesmo padrão já validado na plataforma.
- Erros, sessão expirada e loading tratados de forma uniforme → pontua no nível "Excelente" da rubrica ("experiência fluida mesmo em cenários de erro").

**Negativas / trade-offs**

- O proxy só existe no dev/preview server do Vite; um deploy de produção precisaria de um proxy equivalente (documentar no README).
- Depende de o Auth e o Metrics estarem rodando localmente para o fluxo fim-a-fim.

## Alternativas consideradas

- **Chamar os backends direto do browser** — descartada: bloqueado por CORS.
- **Um BFF próprio de métricas** — descartada nesta fase (decisão do usuário: consumir o Metrics Service T2 dedicado diretamente). Pode virar ADR futuro se a agregação client-side ficar complexa.
