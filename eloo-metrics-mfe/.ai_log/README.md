# .ai_log — Registro de uso de IA

Evidência de **uso crítico de IA** no desenvolvimento do `eloo-metrics-mfe`
(critério de 5% da rubrica). Espelha a convenção do repositório raiz.

## Objetivo

Não basta usar IA — é preciso demonstrar **revisão crítica**: o que foi
aceito, o que foi ajustado, o que foi rejeitado e **por quê**. Este diretório
guarda esse histórico.

## Formato

Um arquivo JSON por data/autor:
`prompt_log_<aaaa-mm-dd>_<autor-kebab>.json`

Cada entrada registra uma iteração relevante:

```json
[
  {
    "timestamp": "2026-07-05T14:32:00-03:00",
    "autor": "lucas-aquino-brentano",
    "contexto": "ADR-0004 — escolha da lib de gráficos",
    "prompt": "Resumo do que foi pedido à IA",
    "resposta_resumo": "O que a IA propôs",
    "decisao": "aceito | ajustado | rejeitado",
    "avaliacao_critica": "Por que foi aceito/ajustado/rejeitado; o que foi validado ou corrigido"
  }
]
```

## Boas práticas

- Registrar decisões arquiteturais e trechos de código não triviais gerados
  com IA — vinculando ao ADR/US correspondente.
- Deixar claro quando a IA **errou** ou "alucinou" e como foi corrigido.
- Este diretório **é versionado** (não vai para o `.gitignore`).
