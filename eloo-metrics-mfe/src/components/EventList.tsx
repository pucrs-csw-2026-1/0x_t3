import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { EventCard } from "./EventCard";
import { EventCardSkeleton } from "./EventCardSkeleton";
import type { EventMetrics } from "../services/metricsApi";

export interface EventListProps {
  events: EventMetrics[];
  onSelectEvent: (eventId: string) => void;
  loading: boolean;
  // Conteúdo exibido quando não há eventos (EmptyState já contextualizado pela
  // página). Só aparece fora do loading.
  empty: ReactNode;
  // Quantos skeletons renderizar no loading (N = page_size atual — US-04).
  skeletonCount?: number;
}

const gridSx = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: { xs: "1fr", xl: "repeat(2, 1fr)" },
} as const;

// Container da lista de eventos (US-04). No loading, N skeletons; sem eventos,
// o estado vazio; caso contrário, um EventCard por evento. Não faz fetch — só
// compõe a partir das props.
export function EventList({
  events,
  onSelectEvent,
  loading,
  empty,
  skeletonCount = 10,
}: EventListProps) {
  if (loading) {
    return (
      <Box sx={gridSx} aria-busy="true">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </Box>
    );
  }

  if (events.length === 0) return <>{empty}</>;

  return (
    <Box sx={gridSx}>
      {events.map((event) => (
        <EventCard
          key={event.eventId}
          eventId={event.eventId}
          name={event.eventName}
          period={{ startDate: event.startDate, endDate: event.endDate }}
          status={event.status}
          counters={{
            registered: event.registered,
            checkedIn: event.checkedIn,
            certified: event.certified,
          }}
          onSelectEvent={onSelectEvent}
        />
      ))}
    </Box>
  );
}
