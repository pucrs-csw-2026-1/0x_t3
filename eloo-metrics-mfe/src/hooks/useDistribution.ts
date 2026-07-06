import { useCallback, useEffect, useRef, useState } from "react";
import type { DistributionParams } from "../services/metricsApi";

export type DistributionStatus = "idle" | "loading" | "error" | "empty" | "ready";

export interface DistributionResult<T> {
  status: DistributionStatus;
  data: T[];
  error: string | null;
  // Refaz APENAS este fetch (retry por painel). Sem efeito com período inválido.
  reload: () => void;
}

// Estado de UM painel de distribuição (US-03). Cada painel usa sua própria
// instância: os fetches disparam em paralelo (mesma renderização) e são
// independentes — a falha de um não bloqueia os outros. Um período inválido
// (`params === null`) NÃO dispara fetch (evita 422 — ADR-0009). Um `requestId`
// descarta respostas fora de ordem ao trocar filtros rapidamente.
export function useDistribution<T extends { count: number }>(
  fetcher: (params: DistributionParams) => Promise<T[]>,
  params: DistributionParams | null,
): DistributionResult<T> {
  const [status, setStatus] = useState<DistributionStatus>("idle");
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);
  // `params` muda de identidade a cada render; fixamos por valor nas deps do
  // efeito e guardamos o atual num ref para o reload manual.
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const run = useCallback(
    async (current: DistributionParams) => {
      const id = ++requestId.current;
      setStatus("loading");
      setError(null);
      try {
        const result = await fetcher(current);
        if (id !== requestId.current) return; // resposta obsoleta
        setData(result);
        const isEmpty = result.length === 0 || result.every((item) => item.count === 0);
        setStatus(isEmpty ? "empty" : "ready");
      } catch (err) {
        if (id !== requestId.current) return;
        setData([]);
        setError(
          err instanceof Error ? err.message : "Não foi possível carregar esta distribuição.",
        );
        setStatus("error");
      }
    },
    [fetcher],
  );

  useEffect(() => {
    if (!params) {
      // Período inválido: cancela qualquer resposta pendente e não busca.
      requestId.current++;
      return;
    }
    void run(params);
    // Dependemos dos valores primitivos, não da identidade do objeto `params`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, params?.from, params?.to, params?.eventId]);

  const reload = useCallback(() => {
    if (paramsRef.current) void run(paramsRef.current);
  }, [run]);

  return { status, data, error, reload };
}
