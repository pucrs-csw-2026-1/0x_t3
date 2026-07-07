import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ForbiddenState } from "./ForbiddenState";

describe("ForbiddenState", () => {
  it("renderiza a mensagem humanizada de 403", () => {
    render(<ForbiddenState onBack={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /acesso negado/i })).toBeInTheDocument();
    expect(screen.getByText(/não tem permissão para ver este evento/i)).toBeInTheDocument();
  });

  it("chama onBack ao clicar em voltar ao catálogo", async () => {
    const onBack = vi.fn();
    render(<ForbiddenState onBack={onBack} />);

    await userEvent.click(screen.getByRole("button", { name: /voltar ao catálogo/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
