import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeProvider, type Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CatalogToolbar } from "../components/CatalogToolbar";
import { EventList } from "../components/EventList";
import { PaginationControls } from "../components/PaginationControls";
import { ErrorAlert } from "../components/ErrorAlert";
import { EmptyState } from "../components/EmptyState";
import { listEventMetrics, type EventMetricsPage } from "../services/metricsApi";
import { getStoredProfile } from "../services/authApi";
import { DEFAULT_PERIOD_KEY, resolvePeriod, type Period, type PeriodKey } from "../utils/periods";
import { theme as defaultTheme } from "../theme";

export interface EventCatalogPageProps {
  // Tema passado pelo shell (ADR-0005); cai no tema próprio quando standalone.
  theme?: Theme;
  // ÚNICA forma de navegar (ADR-0005): a página reporta a seleção e o host
  // decide a rota. Nunca usa useNavigate/router diretamente.
  onSelectEvent: (eventId: string) => void;
}

type Status = "loading" | "error" | "empty" | "ready";

// Página 1 e 10 itens por página como estado inicial (US-04).
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

// US-04 — Catálogo de eventos. Porta de entrada para o detalhe de métricas
// (US-05). Orquestra o fetch paginado (server-side), o seletor de período e a
// busca local, compondo os estados de loading / erro / vazio. O backend escopa
// por RBAC (ADR-0009): admin vê todos, manager vê os seus — mesma chamada,
// dados diferentes. O frontend não filtra por papel; só exibe o que recebe.
export default function EventCatalogPage({ theme, onSelectEvent }: EventCatalogPageProps) {
  const [profile] = useState(() => getStoredProfile());
  const isManager = profile?.accessLevel === "MANAGER";

  const [periodKey, setPeriodKey] = useState<PeriodKey>(DEFAULT_PERIOD_KEY);
  const [customPeriod, setCustomPeriod] = useState<Period>(() => resolvePeriod(DEFAULT_PERIOD_KEY));
  const [period, setPeriod] = useState<Period>(() => resolvePeriod(DEFAULT_PERIOD_KEY));

  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<EventMetricsPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // O período é SEMPRE enviado (ADR-0009) e a paginação é server-side: cada
  // troca de página/tamanho/período dispara um novo fetch — nunca carregamos
  // tudo de uma vez. Um 401 é sinalizado pela camada de serviço
  // (mfeAuth:sessionExpired) e tratado pelo host; a página não redireciona
  // sozinha (ADR-0005).
  const load = useCallback(async (window: Period, targetPage: number, size: number) => {
    setStatus("loading");
    setError(null);
    try {
      const result = await listEventMetrics({ ...window, page: targetPage, pageSize: size });
      setData(result);
      setStatus(result.items.length === 0 ? "empty" : "ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar os eventos.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load(period, page, pageSize);
  }, [load, period, page, pageSize]);

  const handlePeriodChange = (key: PeriodKey, next: Period) => {
    setPeriodKey(key);
    if (key === "custom") setCustomPeriod(next);
    setPeriod(next);
    setPage(DEFAULT_PAGE); // troca de período reseta para a página 1 (US-04)
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(DEFAULT_PAGE); // troca de tamanho reseta para a página 1 (US-04)
  };

  // Busca local: filtra por nome apenas o resultado da página atual (US-04).
  const visibleEvents = useMemo(() => {
    const items = data?.items ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((event) => (event.eventName ?? "").toLowerCase().includes(term));
  }, [data, search]);

  const retry = () => void load(period, page, pageSize);

  // Estado vazio contextual: manager sem eventos no escopo vs. período sem dados.
  // Escolher a mensagem por papel é apresentação (como o título do dashboard na
  // US-02) — não é filtragem de RBAC, que continua sendo do backend.
  const serverEmpty = isManager ? (
    <EmptyState
      title="Nenhum evento sob sua gestão"
      description="Você ainda não tem eventos atribuídos ao seu escopo. Assim que um evento for vinculado, ele aparecerá aqui."
    />
  ) : (
    <EmptyState
      title="Nenhum evento no período"
      description="Não encontramos eventos para o período selecionado. Ajuste o filtro e tente novamente."
    />
  );

  // Vazio por busca local (há eventos na página, mas nenhum casa o termo).
  const searchEmpty = (
    <EmptyState
      title="Nenhum evento corresponde à busca"
      description={`Nenhum evento nesta página corresponde a "${search.trim()}". Ajuste o termo de busca.`}
    />
  );

  return (
    <ThemeProvider theme={theme ?? defaultTheme}>
      <Box
        component="section"
        sx={{ bgcolor: "background.default", minHeight: "100%", p: { xs: 2, lg: 4 } }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Cabeçalho + controles */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { md: "flex-end" },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                color="primary"
                fontWeight={700}
                sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}
              >
                Catálogo de Eventos
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                Selecione um evento para ver suas métricas detalhadas.
              </Typography>
            </Box>
            <CatalogToolbar
              periodKey={periodKey}
              customPeriod={customPeriod}
              onPeriodChange={handlePeriodChange}
              search={search}
              onSearchChange={setSearch}
            />
          </Box>

          {/* Erro (fatal) com retry */}
          {status === "error" && error && <ErrorAlert message={error} onRetry={retry} />}

          {/* Vazio vindo do servidor (período/escopo sem dados) */}
          {status === "empty" && serverEmpty}

          {/* Loading (skeletons) e dados carregados passam pelo EventList */}
          {(status === "loading" || status === "ready") && (
            <EventList
              events={visibleEvents}
              onSelectEvent={onSelectEvent}
              loading={status === "loading"}
              empty={searchEmpty}
              skeletonCount={pageSize}
            />
          )}

          {/* Paginação: só quando há dados do servidor */}
          {status === "ready" && data && (
            <PaginationControls
              page={data.page}
              pageSize={pageSize}
              total={data.total}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
