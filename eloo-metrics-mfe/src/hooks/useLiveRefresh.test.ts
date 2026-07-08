import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useLiveRefresh } from "./useLiveRefresh";

describe("useLiveRefresh", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("dispara o refresh a cada intervalo enquanto ligado", () => {
    const cb = vi.fn();
    renderHook(() => useLiveRefresh(cb, { intervalMs: 5000 }));

    expect(cb).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(5000));
    expect(cb).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(10000));
    expect(cb).toHaveBeenCalledTimes(3);
  });

  it("não dispara quando começa desligado; reage ao setLive(true)", () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useLiveRefresh(cb, { intervalMs: 1000, defaultOn: false }));

    act(() => vi.advanceTimersByTime(3000));
    expect(cb).not.toHaveBeenCalled();

    act(() => result.current.setLive(true));
    act(() => vi.advanceTimersByTime(2000));
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it("chama sempre a versão mais recente do callback (sem stale closure)", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ cb }) => useLiveRefresh(cb, { intervalMs: 1000 }), {
      initialProps: { cb: first },
    });

    rerender({ cb: second });
    act(() => vi.advanceTimersByTime(1000));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("limpa o intervalo ao desmontar", () => {
    const cb = vi.fn();
    const { unmount } = renderHook(() => useLiveRefresh(cb, { intervalMs: 1000 }));

    unmount();
    act(() => vi.advanceTimersByTime(5000));
    expect(cb).not.toHaveBeenCalled();
  });
});
