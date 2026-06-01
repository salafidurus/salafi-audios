"use client";

import { useRef, useEffect } from "react";
import styles from "./MarqueeText.mobile.module.css";

export type MarqueeTextMobileProps = {
  text: string;
  textStyle?: string;
};

export function MarqueeTextMobile({ text, textStyle }: MarqueeTextMobileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const animRef = useRef<Animation | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    animRef.current?.cancel();
    animRef.current = null;

    const containerWidth = container.clientWidth;
    const textWidth = textEl.scrollWidth;
    if (textWidth <= containerWidth) return;

    const distance = textWidth - containerWidth;
    const duration = Math.max(2000, (distance / 40) * 1000);

    animRef.current = textEl.animate(
      [{ transform: "translateX(0)" }, { transform: `translateX(-${distance}px)` }],
      {
        duration,
        delay: 1500,
        iterations: Infinity,
        direction: "alternate",
        easing: "linear",
      },
    );

    return () => {
      animRef.current?.cancel();
    };
  }, [text]);

  return (
    <div ref={containerRef} className={styles.container}>
      <span ref={textRef} className={`${styles.text}${textStyle ? ` ${textStyle}` : ""}`}>
        {text}
      </span>
    </div>
  );
}
