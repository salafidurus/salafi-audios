import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "bun:test";
import React from "react";

import { CookieConsentGate } from "./CookieConsentGate";

const mockUseCookieConsent = vi.fn();

vi.mock("../hooks/use-cookie-consent", () => ({
  useCookieConsent: () => mockUseCookieConsent(),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

describe("CookieConsentGate", () => {
  it("renders nothing while browser storage is unresolved", () => {
    mockUseCookieConsent.mockReturnValue({
      hasAccepted: false,
      isResolved: false,
      accept: vi.fn(),
    });
    const { container } = render(<CookieConsentGate />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the banner only when consent is resolved and absent", () => {
    mockUseCookieConsent.mockReturnValue({ hasAccepted: false, isResolved: true, accept: vi.fn() });
    render(<CookieConsentGate />);
    expect(screen.getByText("Cookies and analytics")).toBeInTheDocument();
  });

  it("keeps the banner absent after consent is accepted", () => {
    mockUseCookieConsent.mockReturnValue({ hasAccepted: true, isResolved: true, accept: vi.fn() });
    const { container } = render(<CookieConsentGate />);
    expect(container).toBeEmptyDOMElement();
  });
});
