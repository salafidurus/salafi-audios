"use client";

import { useRef, useEffect } from "react";
import { type StyleProp, type TextStyle } from "react-native";
import { Text } from "react-native-unistyles/components/native/Text";
import { View } from "react-native-unistyles/components/native/View";
import { StyleSheet } from "react-native-unistyles";

export type MarqueeTextProps = {
  text: string;
  textStyle?: StyleProp<TextStyle>;
};

export function MarqueeText({ text, textStyle }: MarqueeTextProps) {
  const containerRef = useRef<any>(null);
  const textRef = useRef<any>(null);
  const animRef = useRef<Animation | null>(null);

  useEffect(() => {
    const container = containerRef.current as HTMLElement | null;
    const textEl = textRef.current as HTMLElement | null;
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
    <View ref={containerRef} style={styles.container}>
      <Text ref={textRef} style={[styles.marqueeText, textStyle]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  container: {
    overflow: "hidden",
    flexShrink: 1,
  },
  marqueeText: {
    _web: {
      whiteSpace: "nowrap",
      display: "inline-block",
    },
  },
}));
