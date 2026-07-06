import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

// Estado de carregamento do EventCard (mesmo padrão pulse da US-02). Renderizado
// enquanto a página do catálogo ainda não recebeu os eventos do T2.
export function EventCardSkeleton() {
  return (
    <Card variant="outlined" aria-hidden="true" sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Skeleton variant="rounded" width={64} height={22} />
            <Skeleton variant="text" width={140} />
          </Box>
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1.5 }} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Skeleton variant="text" width={88} />
            <Skeleton variant="text" width={88} />
            <Skeleton variant="text" width={88} />
          </Box>
        </Box>
        <Skeleton variant="circular" width={40} height={40} />
      </CardContent>
    </Card>
  );
}
