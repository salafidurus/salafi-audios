import { getApiBaseUrl, initApiClient } from "@sd/core-contracts";
import { render } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import React, { useEffect } from "react";

import { Providers } from "./providers";

describe("Providers API client initialization", () => {
  test("initializes the API client before child components render and run their effects", () => {
    // Reset API client config to unconfigured state
    initApiClient(null as any);
    expect(getApiBaseUrl()).toBe("");

    let apiBaseUrlDuringChildRender = "";
    let apiBaseUrlDuringChildEffect = "";

    function Child() {
      // Record getApiBaseUrl during render phase
      apiBaseUrlDuringChildRender = getApiBaseUrl();

      useEffect(() => {
        // Record getApiBaseUrl during mount effect
        apiBaseUrlDuringChildEffect = getApiBaseUrl();
      }, []);

      return <div>Child</div>;
    }

    render(
      <Providers apiBaseUrl="https://api.test.com" initialLocale="en">
        <Child />
      </Providers>,
    );

    // With the bug, these will fail because the useEffect in Providers runs AFTER Child render and Child useEffect.
    // So both will be empty string.
    expect(apiBaseUrlDuringChildRender).toBe("https://api.test.com");
    expect(apiBaseUrlDuringChildEffect).toBe("https://api.test.com");
  });
});
