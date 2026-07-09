"use client";

import { useEffect, useRef } from "react";

export type MarqueeTextProps = {
  text: string;
  className?: string;
};

export function MarqueeText({ text, className }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = textRef.current;

    if (!container || !content) {
      return;
    }

    animationRef.current?.cancel();
    animationRef.current = null;

    const overflow = content.scrollWidth - container.clientWidth;
    if (overflow <= 0) {
      return;
    }

    const duration = Math.max(2200, (overflow / 44) * 1000);

    animationRef.current = content.animate(
      [{ transform: "translateX(0)" }, { transform: `translateX(-${overflow}px)` }],
      {
        duration,
        delay: 1400,
        iterations: Infinity,
        direction: "alternate",
        easing: "linear",
      },
    );

    return () => {
      animationRef.current?.cancel();
    };
  }, [text]);

  return (
    <div ref={containerRef} className="min-w-0 overflow-hidden">
      <span
        ref={textRef}
        className={className}
        style={{ display: "inline-block", whiteSpace: "nowrap" }}
      >
        {text}
      </span>
    </div>
  );
}
