import { createNativeAnalyticsContext } from "./context";

jest.mock("../i18n/i18n", () => ({ i18n: { language: "ar" } }));

describe("native analytics context", () => {
  it("captures locale, lifecycle, and process-scoped session context", () => {
    const context = createNativeAnalyticsContext("active");

    expect(context).toMatchObject({
      interface_language: "ar",
      session_id: expect.stringMatching(/^session-/),
      lifecycle_state: "active",
    });
  });

  it("keeps the same session across lifecycle events", () => {
    const first = createNativeAnalyticsContext("active");
    const second = createNativeAnalyticsContext("background");

    expect(second.session_id).toBe(first.session_id);
    expect(second.lifecycle_state).toBe("background");
  });
});
