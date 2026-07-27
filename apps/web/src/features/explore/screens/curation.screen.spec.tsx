import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "bun:test";

import { CurationScreen } from "./curation.screen";

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal: string) => defaultVal,
  }),
}));

describe("CurationScreen", () => {
  it("renders curation screen", () => {
    render(<CurationScreen />);

    expect(screen.getByText("Curation")).toBeInTheDocument();
  });

  it("renders coming soon message", () => {
    render(<CurationScreen />);

    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });
});
