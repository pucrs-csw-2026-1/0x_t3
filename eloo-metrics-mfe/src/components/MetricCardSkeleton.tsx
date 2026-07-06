import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

// Estado de carregamento do MetricCard (referência visual: skeleton-pulse).
// Renderizado enquanto os counters ainda não chegaram do T2.
export function MetricCardSkeleton() {
  return (
    <Card variant="outlined" aria-hidden="true" sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rounded" width={44} height={18} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <Skeleton variant="text" width="35%" height={48} />
          <Skeleton variant="rounded" width={96} height={40} />
        </Box>
        <Skeleton variant="text" width="55%" sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );
}
