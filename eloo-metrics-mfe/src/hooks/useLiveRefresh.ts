import { useEffect, useRef, useState } from "react";

// Auto-refresh "ao vivo" (US-08 — demo de métricas em tempo real). Enquanto
// ativo, dispara `refresh` a cada `intervalMs`, sempre chamando a versão mais
// recente do callback (via ref — sem stale closure de período/estado). O
// `refresh` deve fazer uma atualização SILENCIOSA (sem estado de loading) para
// os números subirem sem piscar a tela a cada tick.
export function useLiveRefresh(
  refresh: () => void,
  { intervalMs = 5000, defaultOn = true }: { intervalMs?: number; defaultOn?: boolean } = {},
): { live: boolean; setLive: (on: boolean) => void } {
  const [live, setLive] = useState(defaultOn);
  const refreshRef = useRef(refresh);

  // Mantém a ref apontando para o callback mais recente a cada render.
  useEffect(() => {
    refreshRef.current = refresh;
  });

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => refreshRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [live, intervalMs]);

  return { live, setLive };
}
