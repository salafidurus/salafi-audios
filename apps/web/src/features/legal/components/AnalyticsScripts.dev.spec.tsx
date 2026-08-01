import { cleanup, render } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "bun:test";
import React from "react";

import { AnalyticsScripts } from "./AnalyticsScripts";

vi.mock("../hooks/use-cookie-consent", () => ({
  useCookieConsent: () => ({ hasAccepted: true }),
}));

vi.mock("@/core/config/env", () => ({ isDev: true }));

vi.mock("next/script", () => ({
  default: (props: { src: string }) => <script data-testid="analytics-script" src={props.src} />,
}));

describe("AnalyticsScripts (development)", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not load Vexo in development, even with consent", () => {
    const { queryByTestId } = render(<AnalyticsScripts />);
    expect(queryByTestId("analytics-script")).toBeNull();
  });
});
