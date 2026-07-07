import type { ReactNode } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ErrorAlert } from "./ErrorAlert";
import { EmptyState } from "./EmptyState";
import { DistributionPanelSkeleton } from "./DistributionPanelSkeleton";

// Mensagem de vazio específica da categoria (critério de aceite da US-03).
const EMPTY_DESCRIPTION = "Sem dados para esta categoria no período selecionado.";

export interface DistributionPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  onRetry?: () => void;
  // Permite que o painel de cidades ocupe as duas colunas do grid.
  fullWidth?: boolean;
}

// Wrapper visual padronizado de cada distribuição (US-03). Centraliza os quatro
// estados por painel (loading → skeleton, erro → ErrorAlert com retry, vazio →
// EmptyState, pronto → gráfico) de forma independente: a falha de um painel não
// derruba os outros. Acessibilidade: <section> rotulada, título visível (h3) e
// descrição associada via aria-describedby. O gráfico recebe dados por props —
// nunca faz fetch (ADR-0004/0005).
export function DistributionPanel({
  title,
  description,
  children,
  loading = false,
  error = null,
  empty = false,
  onRetry,
  fullWidth = false,
}: DistributionPanelProps) {
  if (loading) return <DistributionPanelSkeleton />;

  const titleId = `dist-${title.replace(/\s+/g, "-").toLowerCase()}`;
  const descId = description ? `${titleId}-desc` : undefined;

  return (
    <Card
      component="section"
      variant="outlined"
      aria-labelledby={titleId}
      aria-describedby={descId}
      sx={{ borderRadius: 3, height: "100%", gridColumn: fullWidth ? { lg: "1 / -1" } : undefined }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
        <Box>
          <Typography
            id={titleId}
            variant="overline"
            component="h3"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: "0.08em" }}
          >
            {title}
          </Typography>
          {description && (
            <Typography id={descId} variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>

        {error ? (
          <ErrorAlert message={error} onRetry={onRetry} />
        ) : empty ? (
          <EmptyState title="Nenhum dado encontrado" description={EMPTY_DESCRIPTION} />
        ) : (
          // Conteúdo curto centraliza no espaço do card (o grid estica os cards
          // à altura da linha — sem isso, painéis baixos como o de gênero ficam
          // com um vão embaixo).
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {children}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
