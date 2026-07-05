# ADR-0006: Fluxo de design Stitch → Material/MUI → código

**Status:** Aceito
**Criado em:** 2026-07-05
**Autor:** Grupo 0x

## Contexto

**Prototipagem:** as telas do `eloo-metrics-mfe` serão prototipadas no
**Stitch** (ferramenta de design de UI do Google, com saída em Material Design /
HTML+Tailwind).

**Necessidade:** definir como o design vira código sem divergir do design system
Eloo (`DESIGN.md`) nem do contrato de páginas
([ADR-0005](0005-contrato-paginas-remote.md)).

## Decisão

Adotar o fluxo **Stitch → tokens Eloo → MUI/Tailwind → código**:

1. **Prototipar no Stitch** cada tela de métricas (dashboards, detalhe de
   evento, filtros). O Stitch já produz Material Design, o que reduz a
   distância até MUI.
2. **Reconciliar tokens:** ajustar cores/tipografia da saída do Stitch para os
   tokens do `DESIGN.md` (primary `#981652`/`#b8336a`, Public Sans + Space
   Grotesk, raios `sm 4px`/`md 8px`). O `tailwind.config.js` e o `theme.ts`
   são a fonte de verdade — o Stitch é referência visual, não fonte de tokens.
3. **Traduzir para componentes MUI:** o HTML/Tailwind do Stitch é reescrito com
   componentes **MUI** (Material UI) — botões, campos, cards, tabelas — usando
   Tailwind apenas para layout utilitário, como no `mfe-auth`.
4. **Aderir ao contrato de remote:** a tela final recebe `theme?` por prop e
   reporta ações via callbacks; nada de navegação interna.
5. **Guardar os artefatos de design** em `docs/design/` (exports/links do
   Stitch) para rastreabilidade e para a apresentação.

## Consequências

**Positivas**
- Prototipagem rápida com saída já em Material Design.
- Design system Eloo preservado (Stitch não dita tokens).
- Handoff design→código documentado (pontua em Documentação e Apresentação da
  rubrica).

**Negativas / trade-offs**
- A saída do Stitch não é usada verbatim — há retrabalho de tradução para MUI e
  reconciliação de tokens. É intencional (evita drift do design system).

## Alternativas consideradas

- **Usar o HTML/Tailwind do Stitch diretamente** — descartada: introduziria
  markup fora do padrão MUI e tokens divergentes do `DESIGN.md`.
- **Desenhar direto no código sem protótipo** — descartada: perde-se validação
  visual antecipada e material para a apresentação.
