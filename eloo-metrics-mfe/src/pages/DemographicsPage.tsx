import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, type Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DemographicsToolbar } from "../components/DemographicsToolbar";
import { DistributionPanel } from "../components/DistributionPanel";
import { AgeDistributionChart } from "../components/charts/AgeDistributionChart";
import { GenderDistributionChart } from "../components/charts/GenderDistributionChart";
import { CityDistributionChart } from "../components/charts/CityDistributionChart";
import { ProfileDistributionChart } from "../components/charts/ProfileDistributionChart";
import { TypeDistributionChart } from "../components/charts/TypeDistributionChart";
import { HoursDistributionChart } from "../components/charts/HoursDistributionChart";
import type { EventOption } from "../components/EventSelector";
import { useDistribution, type DistributionStatus } from "../hooks/useDistribution";
import {
  listEventMetrics,
  getByAge,
  getByGender,
  getByCity,
  getByProfile,
  getByType,
  getHoursDistribution,
  type DistributionParams,
} from "../services/metricsApi";
import { getStoredProfile } from "../services/authApi";
import { DEFAULT_PERIOD_KEY, resolvePeriod, type Period, type PeriodKey } from "../utils/periods";
import { periodToMonthRange, validatePeriod } from "../utils/demographics";
import { theme as defaultTheme } from "../theme";

export interface DemographicsPageProps {
  // Tema passado pelo shell (ADR-0005); cai no tema próprio quando standalone.
  theme?: Theme;
  // Evento inicial (opcional). Ausente = dados globais (todos os eventos).
  eventId?: string;
}

// idle conta como loading: entre a 1ª renderização e o efeito de fetch, evita
// piscar um gráfico vazio antes do skeleton.
function isLoading(status: DistributionStatus): boolean {
  return status === "loading" || status === "idle";
}

// US-03/US-06 — Distribuições demográficas. Exposta como remote (ADR-0005):
// recebe o tema por prop e não gerencia sessão/rota. Orquestra os 6 fetches
// independentes (faixa etária, gênero, cidade, perfil, tipo e horas de
// participação), o toolbar (evento + período) e a validação de intervalo ANTES
// do fetch (evita 422). Cada painel gerencia seu próprio estado de
// loading/erro/vazio; a falha de um não derruba os outros. Os gráficos recebem
// dados por props — nenhum faz fetch (ADR-0004).
export default function DemographicsPage({
  theme,
  eventId: initialEventId,
}: DemographicsPageProps) {
  const [periodKey, setPeriodKey] = useState<PeriodKey>(DEFAULT_PERIOD_KEY);
  const [customPeriod, setCustomPeriod] = useState<Period>(() => resolvePeriod(DEFAULT_PERIOD_KEY));
  const [period, setPeriod] = useState<Period>(() => resolvePeriod(DEFAULT_PERIOD_KEY));
  const [eventId, setEventId] = useState<string | undefined>(initialEventId);
  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);

  // Manager analisa POR evento (US-06): sem a opção "Todos os eventos" — o
  // primeiro evento do escopo é selecionado automaticamente quando as opções
  // chegam, e nenhum fetch agregado é disparado antes disso.
  const [userProfile] = useState(() => getStoredProfile());
  const isManager = userProfile?.accessLevel === "MANAGER";

  // Valida o intervalo ANTES de qualquer fetch (ADR-0009). Com erro, os params
  // ficam nulos: os hooks não disparam fetch e mantêm os últimos dados; o erro
  // aparece inline no toolbar (não como alert global).
  const validationError = validatePeriod(period);
  const params: DistributionParams | null = useMemo(() => {
    if (validationError) return null;
    if (isManager && !eventId) return null; // aguarda a auto-seleção do evento
    const { from, to } = periodToMonthRange(period);
    return { from, to, eventId };
  }, [validationError, isManager, period, eventId]);

  const age = useDistribution(getByAge, params);
  const gender = useDistribution(getByGender, params);
  const city = useDistribution(getByCity, params);
  const profile = useDistribution(getByProfile, params);
  const type = useDistribution(getByType, params);
  const hours = useDistribution(getHoursDistribution, params);

  // Popula o filtro de evento com os eventos do período (reaproveita
  // listEventMetrics da US-01). Não-fatal: se falhar, o seletor mantém só
  // "Todos os eventos". O período é sempre enviado (ADR-0009).
  useEffect(() => {
    if (validationError) return;
    let active = true;
    listEventMetrics({
      startDate: period.startDate,
      endDate: period.endDate,
      page: 1,
      pageSize: 200,
    })
      .then((result) => {
        if (!active) return;
        const options = result.items.map((item) => ({
          id: item.eventId,
          name: item.eventName ?? item.eventId,
        }));
        setEventOptions(options);
        // Manager sem evento selecionado: assume o primeiro do escopo (US-06).
        if (isManager && options.length > 0) {
          setEventId((current) => current ?? options[0].id);
        }
      })
      .catch(() => {
        /* seletor de evento é opcional; falha não bloqueia as distribuições */
      });
    return () => {
      active = false;
    };
  }, [period.startDate, period.endDate, validationError, isManager]);

  const handlePeriodChange = (key: PeriodKey, next: Period) => {
    setPeriodKey(key);
    if (key === "custom") setCustomPeriod(next);
    setPeriod(next);
  };

  return (
    <ThemeProvider theme={theme ?? defaultTheme}>
      <Box
        component="section"
        sx={{
          bgcolor: "background.default",
          minHeight: "100%",
          p: { xs: 2, lg: 4 },
          pb: { xs: 6, lg: 8 },
        }}
      >
        <Box sx={{ maxWidth: 1440, mx: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
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
                Distribuições Demográficas
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                Análise do perfil dos participantes por dimensão.
              </Typography>
            </Box>
            <DemographicsToolbar
              periodKey={periodKey}
              customPeriod={customPeriod}
              onPeriodChange={handlePeriodChange}
              eventId={eventId}
              eventOptions={eventOptions}
              onEventChange={setEventId}
              allowAllEvents={!isManager}
              validationError={validationError}
            />
          </Box>

          {/* Grid de painéis: cada um independente (loading/erro/vazio próprios) */}
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
            }}
          >
            <DistributionPanel
              title="Faixa Etária"
              loading={isLoading(age.status)}
              error={age.status === "error" ? age.error : null}
              empty={age.status === "empty"}
              onRetry={age.reload}
            >
              <AgeDistributionChart data={age.data} />
            </DistributionPanel>

            {/* Coluna da direita: gênero + horas de participação empilhados
                (US-06 — pedido do usuário: horas logo abaixo do gênero). */}
            <Box sx={{ display: "grid", gap: 2, gridTemplateRows: "1fr auto" }}>
              <DistributionPanel
                title="Gênero"
                loading={isLoading(gender.status)}
                error={gender.status === "error" ? gender.error : null}
                empty={gender.status === "empty"}
                onRetry={gender.reload}
              >
                <GenderDistributionChart data={gender.data} />
              </DistributionPanel>

              <DistributionPanel
                title="Horas de Participação"
                description="Participantes por faixa de horas de engajamento no período."
                loading={isLoading(hours.status)}
                error={hours.status === "error" ? hours.error : null}
                empty={hours.status === "empty"}
                onRetry={hours.reload}
              >
                <HoursDistributionChart data={hours.data} />
              </DistributionPanel>
            </Box>

            <DistributionPanel
              title="Cidades (Top 10)"
              loading={isLoading(city.status)}
              error={city.status === "error" ? city.error : null}
              empty={city.status === "empty"}
              onRetry={city.reload}
              fullWidth
            >
              <CityDistributionChart data={city.data} />
            </DistributionPanel>

            <DistributionPanel
              title="Perfil do Participante"
              loading={isLoading(profile.status)}
              error={profile.status === "error" ? profile.error : null}
              empty={profile.status === "empty"}
              onRetry={profile.reload}
            >
              <ProfileDistributionChart data={profile.data} />
            </DistributionPanel>

            <DistributionPanel
              title="Tipo de Evento"
              // O by-type real do T2 não filtra por evento (US-06): quando há um
              // evento selecionado, deixamos explícito que esta dimensão é global.
              description={
                eventId ? "Visão global do período — o filtro de evento não se aplica." : undefined
              }
              loading={isLoading(type.status)}
              error={type.status === "error" ? type.error : null}
              empty={type.status === "empty"}
              onRetry={type.reload}
            >
              <TypeDistributionChart data={type.data} />
            </DistributionPanel>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
