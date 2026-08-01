import { cleanup, render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "bun:test";
import React from "react";

import { AnalyticsScripts } from "./AnalyticsScripts";

const mockUseCookieConsent = vi.fn(() => ({ hasAccepted: true }));

vi.mock("../hooks/use-cookie-consent", () => ({
  useCookieConsent: () => mockUseCookieConsent(),
}));

// Module mocks in bun:test snapshot their return value once per test file,
// so isDev must be pinned per-file — see AnalyticsScripts.dev.spec.tsx for the
// isDev=true case.
vi.mock("@/core/config/env", () => ({ isDev: false }));

vi.mock("next/script", () => ({
  default: (props: { src: string }) => <script data-testid="analytics-script" src={props.src} />,
}));

describe("AnalyticsScripts (production)", () => {
  beforeEach(() => {
    mockUseCookieConsent.mockReturnValue({ hasAccepted: true });
  });

  afterEach(() => {
    cleanup();
  });

  it("loads Vexo when consent is given and not in development", () => {
    const { queryByTestId } = render(<AnalyticsScripts />);
    expect(queryByTestId("analytics-script")).not.toBeNull();
  });

  it("does not load Vexo without consent", () => {
    mockUseCookieConsent.mockReturnValue({ hasAccepted: false });
    const { queryByTestId } = render(<AnalyticsScripts />);
    expect(queryByTestId("analytics-script")).toBeNull();
  });
});
