import type { ReactNode } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import { formatNumber, formatPercent } from "../utils/format";
import type { RankedEvent } from "../utils/ranking";

export interface EventRankingProps {
  best: RankedEvent[];
  worst: RankedEvent[];
  title?: string;
}

// Ranking de eventos por taxa de adesão (Top melhores e piores). Recebe as listas
// já ordenadas pela camada de derivação (utils/ranking) — não faz fetch nem
// ordena (ADR-0005). Textos e percentuais em pt-BR.
export function EventRanking({
  best,
  worst,
  title = "Ranking de Eventos por Adesão",
}: EventRankingProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" component="h3" color="primary" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          Taxa de check-in (presentes ÷ inscritos) por evento no período.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          }}
        >
          <RankingColumn
            heading="Melhores"
            emphasis="success.main"
            icon={<TrendingUpOutlinedIcon fontSize="small" />}
            events={best}
          />
          <RankingColumn
            heading="Piores"
            emphasis="error.main"
            icon={<TrendingDownOutlinedIcon fontSize="small" />}
            events={worst}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

function RankingColumn({
  heading,
  emphasis,
  icon,
  events,
}: {
  heading: string;
  emphasis: string;
  icon: ReactNode;
  events: RankedEvent[];
}) {
  return (
    <Box component="section" aria-label={`${heading} eventos por adesão`}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1, color: emphasis }}>
        {icon}
        <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: "0.05em" }}>
          {heading}
        </Typography>
      </Box>

      {events.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Sem eventos no período.
        </Typography>
      ) : (
        <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {events.map((event, index) => (
            <Box
              component="li"
              key={event.eventId}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 1,
                borderBottom: index < events.length - 1 ? 1 : 0,
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                sx={{ width: 20, color: "text.secondary", fontWeight: 700 }}
              >
                {index + 1}
              </Typography>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {event.eventName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatNumber(event.checkedIn)} de {formatNumber(event.registered)} inscritos
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={700} sx={{ color: emphasis }}>
                {formatPercent(event.rate)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
