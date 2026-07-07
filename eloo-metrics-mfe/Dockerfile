# Imagem do remote de métricas (T3 — eloo-metrics-mfe). Ver ADR-0012.
# Multi-stage: um estágio builda o app Vite (gera o remoteEntry.js) e outro
# serve com `vite preview` (:5176) — o mesmo runtime do `npm run serve:remote`,
# reusando o proxy do vite.config (/api -> T2, /auth-api -> T1; contorno de CORS,
# ADR-0003) sem precisar de um nginx.conf à parte.

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
# Camada de deps cacheável: só invalida quando package*.json muda.
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- serve ----
FROM node:20-alpine AS serve
WORKDIR /app
ENV NODE_ENV=production
# `vite preview` precisa do dist, da config (proxy) e do vite/plugins instalados.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/vite.config.ts ./vite.config.ts
COPY --from=build /app/package.json ./package.json

# Alvos do proxy server-to-server (ADR-0003). Padrão: backends rodando no HOST,
# alcançados de dentro do container via host.docker.internal. Sobrescreva por env
# (docker-compose / `docker run -e ...`) para outros ambientes.
ENV METRICS_SERVICE_URL=http://host.docker.internal:8000
ENV AUTH_SERVICE_URL=http://host.docker.internal:8080

# Porta do remote (ADR-0001/0010). `--host` expõe o preview fora do container.
EXPOSE 5176
CMD ["npx", "vite", "preview", "--host", "--port", "5176"]
