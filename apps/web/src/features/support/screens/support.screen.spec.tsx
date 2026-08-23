import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "bun:test";

import { SupportScreen } from "./support.screen";

describe("SupportScreen", () => {
  it("leads with an issue report form and keeps submission ready for the backend", () => {
    render(<SupportScreen />);

    expect(screen.getByText("Report an issue")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Your name" })).toBeRequired();
    expect(screen.getByRole("textbox", { name: "Email address" })).toBeRequired();
    expect(screen.getByRole("textbox", { name: "What happened?" })).toBeRequired();
    expect(screen.getByRole("button", { name: "Send to maintainers" })).toBeDisabled();
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
  });

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
