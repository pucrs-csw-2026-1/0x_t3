import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ErrorAlert } from "./ErrorAlert";

describe("ErrorAlert", () => {
  it("exibe a mensagem e chama onRetry ao clicar em 'Tentar novamente'", async () => {
    const onRetry = vi.fn();
    render(<ErrorAlert message="Falha ao carregar." onRetry={onRetry} />);

    expect(screen.getByText("Falha ao carregar.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
