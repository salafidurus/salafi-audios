/** Observes web content visibility and emits one timed impression per identity. */
import { useEffect, useRef } from "react";

/**
 * Binds one public content identity to a timed visibility observation.
 * Unsupported observer environments safely produce no event.
 */
type ViewableImpressionOptions = {
  /** Stable content/context identity used to prevent repeated observations. */
  identityKey: string;
  /** Called once after the visibility rule is satisfied. */
  onImpression: () => void;
  /** Fraction of the element that must intersect the viewport. */
  threshold?: number;
  /** Continuous visibility duration required before reporting. */
  minimumViewTimeMs?: number;
};

/**
 * Observes an element until it remains above the configured visibility
 * threshold for the configured dwell time, then reports one impression.
 * Unsupported observer environments are intentionally a no-op.
 */
export function useViewableImpression<TElement extends HTMLElement = HTMLElement>({
  identityKey,
  onImpression,
  threshold = 0.5,
  minimumViewTimeMs = 1000,
}: ViewableImpressionOptions) {
  const elementRef = useRef<TElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reportedKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !("IntersectionObserver" in globalThis)) return;

    const clearTimer = () => {
      if (timerRef.current !== undefined) clearTimeout(timerRef.current);
      timerRef.current = undefined;
    };
    const observer = new globalThis.IntersectionObserver(
      ([entry]) => {
        if (!entry || entry.intersectionRatio < threshold) {
          clearTimer();
          return;
        }
        if (reportedKeyRef.current === identityKey || timerRef.current !== undefined) return;
        timerRef.current = setTimeout(() => {
          timerRef.current = undefined;
          reportedKeyRef.current = identityKey;
          onImpression();
        }, minimumViewTimeMs);
      },
      { threshold },
    );
    observer.observe(element);
    return () => {
      clearTimer();
      observer.disconnect();
    };
  }, [identityKey, minimumViewTimeMs, onImpression, threshold]);

  return elementRef;
}
