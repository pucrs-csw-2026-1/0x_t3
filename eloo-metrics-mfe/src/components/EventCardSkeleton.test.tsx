import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EventCardSkeleton } from "./EventCardSkeleton";

describe("EventCardSkeleton", () => {
  it("renderiza sem props, exibindo os placeholders pulse", () => {
    const { container } = render(<EventCardSkeleton />);

    // Mesmo padrão de pulse da US-02 (MuiSkeleton-root).
    expect(container.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(0);
    // É decorativo: escondido de leitores de tela.
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
