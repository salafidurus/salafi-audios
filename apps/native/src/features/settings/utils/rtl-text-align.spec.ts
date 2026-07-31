import { I18nManager } from "react-native";

import { getRtlAwareTextAlign } from "./rtl-text-align";

describe("getRtlAwareTextAlign", () => {
  const originalIsRTL = I18nManager.isRTL;

  afterEach(() => {
    I18nManager.isRTL = originalIsRTL;
  });

  it("returns 'left' when the layout direction is not RTL", () => {
    I18nManager.isRTL = false;

    expect(getRtlAwareTextAlign()).toBe("left");
  });

  it("returns 'right' when the layout direction is RTL", () => {
    I18nManager.isRTL = true;

    expect(getRtlAwareTextAlign()).toBe("right");
  });
});
