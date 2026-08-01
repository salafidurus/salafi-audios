import { getRtlAwareTextAlign } from "./rtl-text-align";

describe("getRtlAwareTextAlign", () => {
  it("returns 'left' when the direction is 'ltr'", () => {
    expect(getRtlAwareTextAlign("ltr")).toBe("left");
  });

  it("returns 'right' when the direction is 'rtl'", () => {
    expect(getRtlAwareTextAlign("rtl")).toBe("right");
  });
});
