import { render, screen } from "@testing-library/react";
import { describe, expect, it, mock } from "bun:test";

mock.module("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        "admin.checkingAccess": "Checking access…",
        "admin.accessDeniedTitle": "Access Denied",
        "admin.accessDenied": "You do not have admin access.",
      })[key as "admin.checkingAccess" | "admin.accessDeniedTitle" | "admin.accessDenied"],
  }),
}));

const { AdminAccessState } = await import("./AdminAccessState");

describe("AdminAccessState", () => {
  it("renders the localized loading message", () => {
    render(<AdminAccessState status="loading" />);
    expect(screen.getByText("Checking access…")).toBeInTheDocument();
  });

  it("renders the localized denied message", () => {
    render(<AdminAccessState status="denied" />);
    expect(
      screen.getByText("You do not have admin access.", { selector: "p" }),
    ).toBeInTheDocument();
  });
});
