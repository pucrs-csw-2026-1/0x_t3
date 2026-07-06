import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { NotFoundState } from "./NotFoundState";

describe("NotFoundState", () => {
  it("renderiza título e subtítulo do 404", () => {
    render(<NotFoundState onBack={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /evento não encontrado/i })).toBeInTheDocument();
    expect(screen.getByText(/não existe ou foi removido/i)).toBeInTheDocument();
  });

  it("chama onBack ao clicar em voltar ao catálogo", async () => {
    const onBack = vi.fn();
    render(<NotFoundState onBack={onBack} />);

    await userEvent.click(screen.getByRole("button", { name: /voltar ao catálogo/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
