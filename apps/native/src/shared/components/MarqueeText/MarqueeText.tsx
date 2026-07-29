import type { StyleProp, TextStyle } from "react-native";

import { useEffect, useState } from "react";
import { Animated, Easing, View } from "react-native";

import { AppText, type AppTextProps } from "@/shared/components/AppText/AppText";

export type MarqueeTextProps = {
  text: string;
  variant?: AppTextProps["variant"];
  style?: StyleProp<TextStyle>;
  speed?: number;
  delayMs?: number;
};

export function MarqueeText({
  text,
  variant = "bodyMd",
  style,
  speed = 44,
  delayMs = 1400,
}: MarqueeTextProps) {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [textWidth, setTextWidth] = useState<number>(0);
  const [translateX] = useState(() => new Animated.Value(0));

  const overflow = textWidth - containerWidth;
  const shouldAnimate = overflow > 2;

  useEffect(() => {
    if (!shouldAnimate) {
      translateX.setValue(0);
      return;
    }

    const duration = Math.max(2200, (overflow / speed) * 1000);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delayMs),
        Animated.timing(translateX, {
          toValue: -overflow,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(translateX, {
          toValue: 0,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shouldAnimate, overflow, speed, delayMs, translateX, text]);

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={{ overflow: "hidden", minWidth: 0, width: "100%" }}
    >
      <View style={{ opacity: textWidth === 0 ? 0 : 1 }}>
        <Animated.View
          style={{
            transform: [{ translateX }],
            alignSelf: "flex-start",
          }}
        >
          <AppText
            variant={variant}
            style={style}
            numberOfLines={1}
            onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
          >
            {text}
          </AppText>
        </Animated.View>
      </View>
    </View>
  );
}
