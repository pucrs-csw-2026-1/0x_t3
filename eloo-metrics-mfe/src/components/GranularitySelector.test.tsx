import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { GranularitySelector } from "./GranularitySelector";

describe("GranularitySelector", () => {
  it("renderiza o valor atual em pt-BR", () => {
    render(<GranularitySelector value="month" onChange={vi.fn()} />);
    expect(screen.getByRole("combobox", { name: /granularidade/i })).toHaveTextContent("Mensal");
  });

  it("chama onChange com a chave correta ao selecionar Trimestral", async () => {
    const onChange = vi.fn();
    render(<GranularitySelector value="month" onChange={onChange} />);

    await userEvent.click(screen.getByRole("combobox", { name: /granularidade/i }));
    await userEvent.click(screen.getByRole("option", { name: "Trimestral" }));

    expect(onChange).toHaveBeenCalledWith("quarter");
  });

  it("mapeia Anual para year", async () => {
    const onChange = vi.fn();
    render(<GranularitySelector value="month" onChange={onChange} />);

    await userEvent.click(screen.getByRole("combobox", { name: /granularidade/i }));
    await userEvent.click(screen.getByRole("option", { name: "Anual" }));

    expect(onChange).toHaveBeenCalledWith("year");
  });
});
