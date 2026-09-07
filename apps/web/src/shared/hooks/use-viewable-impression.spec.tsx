import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "bun:test";

import { useViewableImpression } from "./use-viewable-impression";

describe("useViewableImpression", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports after 1 second at exactly 50 percent visibility", () => {
    vi.useFakeTimers();
    let observe: ((entries: Array<{ intersectionRatio: number }>) => void) | undefined;
    class TestIntersectionObserver {
      constructor(callback: typeof observe) {
        observe = callback;
      }

      observe() {}
      disconnect() {}
    }
    Object.defineProperty(globalThis, "IntersectionObserver", {
      configurable: true,
      value: TestIntersectionObserver,
    });
    const onImpression = vi.fn();
    function Target() {
      const ref = useViewableImpression<HTMLDivElement>({
        identityKey: "listing:lesson:batch:0",
        onImpression,
      });
      return <div ref={ref} />;
    }
    render(<Target />);

    act(() => observe?.([{ intersectionRatio: 0.5 }]));
    act(() => vi.advanceTimersByTime(999));
    expect(onImpression).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onImpression).toHaveBeenCalledTimes(1);
  });

  it("cancels a dwell timer when visibility drops below the threshold", () => {
    vi.useFakeTimers();
    let observe: ((entries: Array<{ intersectionRatio: number }>) => void) | undefined;
    class TestIntersectionObserver {
      constructor(callback: typeof observe) {
        observe = callback;
      }

      observe() {}
      disconnect() {}
    }
    Object.defineProperty(globalThis, "IntersectionObserver", {
      configurable: true,
      value: TestIntersectionObserver,
    });
    const onImpression = vi.fn();
    function Target() {
      const ref = useViewableImpression<HTMLDivElement>({
        identityKey: "listing:lesson:batch:0",
        onImpression,
      });
      return <div ref={ref} />;
    }
    render(<Target />);

    act(() => observe?.([{ intersectionRatio: 0.5 }]));
    act(() => vi.advanceTimersByTime(500));
    act(() => observe?.([{ intersectionRatio: 0.49 }]));
    act(() => vi.advanceTimersByTime(1000));
    expect(onImpression).not.toHaveBeenCalled();
  });
});
