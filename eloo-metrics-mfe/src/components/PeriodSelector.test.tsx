import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { PeriodSelector } from "./PeriodSelector";
import { resolvePeriod, type Period } from "../utils/periods";

const CUSTOM: Period = { startDate: "2026-01-01", endDate: "2026-01-31" };

describe("PeriodSelector", () => {
  it("emite a janela resolvida ao escolher um preset (nunca sem período)", async () => {
    const onChange = vi.fn();
    render(<PeriodSelector value="last30" customPeriod={CUSTOM} onChange={onChange} />);

    await userEvent.click(screen.getByRole("combobox", { name: /período/i }));
    await userEvent.click(screen.getByRole("option", { name: /últimos 7 dias/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [key, period] = onChange.mock.calls[0];
    expect(key).toBe("last7");
    // A janela emitida bate com a resolução do preset e sempre traz as duas datas.
    expect(period).toEqual(resolvePeriod("last7"));
    expect(period.startDate).toBeTruthy();
    expect(period.endDate).toBeTruthy();
  });

  it("no modo personalizado, editar uma data emite a nova janela custom", async () => {
    const onChange = vi.fn();
    render(<PeriodSelector value="custom" customPeriod={CUSTOM} onChange={onChange} />);

    const start = screen.getByLabelText("De");
    fireEvent.change(start, { target: { value: "2026-02-10" } });

    const lastCall = onChange.mock.calls.at(-1)!;
    expect(lastCall[0]).toBe("custom");
    // Preserva a outra ponta e emite a nova; a janela nunca fica sem período.
    expect(lastCall[1]).toEqual({ startDate: "2026-02-10", endDate: "2026-01-31" });
  });
});
