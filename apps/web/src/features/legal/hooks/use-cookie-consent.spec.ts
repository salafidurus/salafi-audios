import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "bun:test";
import React from "react";

import { useCookieConsent } from "./use-cookie-consent";

describe("useCookieConsent", () => {
  afterEach(() => {
    window.localStorage.clear();
    cleanup();
  });

  it("resolves absent browser consent after the hydration snapshot", async () => {
    const snapshots: Array<ReturnType<typeof useCookieConsent>> = [];
    function Probe() {
      snapshots.push(useCookieConsent());
      return null;
    }

    const { unmount } = render(React.createElement(Probe));

    await waitFor(() => {
      expect(snapshots.at(-1)).toMatchObject({ hasAccepted: false, isResolved: true });
    });
    unmount();
  });
});
