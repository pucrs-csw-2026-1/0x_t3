import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

// Skeleton de um painel de distribuição (US-03), no padrão de loading da US-02:
// título placeholder + algumas linhas de "barras" pulsando. Usado pelo
// DistributionPanel quando loading=true.
export function DistributionPanelSkeleton() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }} aria-busy="true">
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Skeleton variant="text" width="40%" height={24} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
          {[80, 60, 45, 30].map((width) => (
            <Box key={width} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Skeleton variant="text" width={48} />
              <Skeleton variant="rounded" height={10} sx={{ flex: 1, maxWidth: `${width}%` }} />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
