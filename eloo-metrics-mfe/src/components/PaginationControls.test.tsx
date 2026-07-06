import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { PaginationControls } from "./PaginationControls";

describe("PaginationControls", () => {
  it("exibe 'Mostrando X–Y de Z eventos' com números pt-BR", () => {
    render(
      <PaginationControls
        page={1}
        pageSize={10}
        total={47}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/Mostrando 1–10 de 47 eventos/)).toBeInTheDocument();
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("na última página o 'até' é o total (não o múltiplo do page_size)", () => {
    render(
      <PaginationControls
        page={5}
        pageSize={10}
        total={47}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/Mostrando 41–47 de 47 eventos/)).toBeInTheDocument();
  });

  it("total zero: intervalo 0–0 de 0", () => {
    render(
      <PaginationControls
        page={1}
        pageSize={10}
        total={0}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/Mostrando 0–0 de 0 eventos/)).toBeInTheDocument();
  });

  it("desabilita 'anterior' na primeira página e navega em 'próxima'", async () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        page={1}
        pageSize={10}
        total={47}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /página anterior/i })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: /próxima página/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("desabilita 'próxima' na última página", () => {
    render(
      <PaginationControls
        page={5}
        pageSize={10}
        total={47}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /próxima página/i })).toBeDisabled();
  });

  it("chama onPageSizeChange com o novo tamanho", async () => {
    const onPageSizeChange = vi.fn();
    render(
      <PaginationControls
        page={1}
        pageSize={10}
        total={47}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    await userEvent.click(screen.getByRole("combobox", { name: /por página/i }));
    await userEvent.click(screen.getByRole("option", { name: "25" }));

    expect(onPageSizeChange).toHaveBeenCalledWith(25);
  });
});
