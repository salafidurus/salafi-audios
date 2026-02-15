import React from "react";
import { render } from "@testing-library/react";
import { NowPlayingBar } from "./now-playing-bar";

function mockResizeObserver() {
  class RO {
    observe() {}
    disconnect() {}
    unobserve() {}
  }

  global.ResizeObserver = RO;
}

describe("NowPlayingBar", () => {
  let rectSpy: jest.SpyInstance;

  beforeEach(() => {
    mockResizeObserver();

    rectSpy = jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 96,
      toJSON: () => "",
    } as DOMRect);
  });

  afterEach(() => {
    rectSpy.mockRestore();
    document.documentElement.style.removeProperty("--floating-player-height");
    document.body.style.paddingBottom = "";
  });

  it("sets a global CSS var for the floating player height when mounted", () => {
    render(<NowPlayingBar title="x" scholar="y" progressPercent={42} />);

    expect(document.documentElement.style.getPropertyValue("--floating-player-height")).toBe(
      "96px",
    );
  });

  it("clears the global CSS var on unmount", () => {
    const { unmount } = render(<NowPlayingBar title="x" scholar="y" progressPercent={42} />);
    unmount();

    expect(document.documentElement.style.getPropertyValue("--floating-player-height")).toBe("0px");
  });
});
