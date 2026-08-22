import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "bun:test";

import { SupportScreen } from "./support.screen";

describe("SupportScreen", () => {
  it("exposes FAQ answers through keyboard-accessible disclosure controls", () => {
    render(<SupportScreen />);

    const question = screen.getByRole("button", { name: "What is Salafi Durus?" });
    expect(question).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByText(
        "Salafi Durus is a platform for authentic Islamic audio lectures from trusted scholars following the Salafi methodology.",
      ),
    ).not.toBeInTheDocument();

    fireEvent.click(question);

    expect(question).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(
        "Salafi Durus is a platform for authentic Islamic audio lectures from trusted scholars following the Salafi methodology.",
      ),
    ).toBeInTheDocument();
  });

  it("provides direct contact and legal navigation", () => {
    render(<SupportScreen />);

    expect(screen.getByRole("link", { name: "support@salafidurus.com" })).toHaveAttribute(
      "href",
      "mailto:support@salafidurus.com",
    );
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(screen.getByRole("link", { name: "Terms of Use" })).toHaveAttribute(
      "href",
      "/terms-of-use",
    );
  });
});
