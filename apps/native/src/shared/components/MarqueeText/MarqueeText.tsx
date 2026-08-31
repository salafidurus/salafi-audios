import type { StyleProp, TextStyle } from "react-native";

import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { AppText, type AppTextProps } from "@/shared/components/AppText/AppText";

/** Provides a reusable native UI primitive with a focused rendering contract. */
/** Describes the inputs, callbacks, and optional state accepted by Marquee Text. */
export type MarqueeTextProps = {
  text: string;
  variant?: AppTextProps["variant"];
  style?: StyleProp<TextStyle>;
  speed?: number;
  delayMs?: number;
};

/** Defines the native marquee text contract used by this module. */
export function MarqueeText({
  text,
  variant = "bodyMd",
  style,
  speed = 44,
  delayMs = 1400,
}: MarqueeTextProps) {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [textWidth, setTextWidth] = useState<number>(0);
  const translateX = useSharedValue(0);

  const overflow = textWidth - containerWidth;
  const shouldAnimate = overflow > 2;

  useEffect(() => {
    if (!shouldAnimate) {
      translateX.value = 0;
      return;
    }

    const duration = Math.max(2200, (overflow / speed) * 1000);

    translateX.value = 0;
    translateX.value = withRepeat(
      withSequence(
        withDelay(delayMs, withTiming(-overflow, { duration, easing: Easing.linear })),
        withDelay(1000, withTiming(0, { duration, easing: Easing.linear })),
      ),
      -1,
    );

    return () => {
      cancelAnimation(translateX);
    };
  }, [shouldAnimate, overflow, speed, delayMs, translateX, text]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    alignSelf: "flex-start",
  }));

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={{ overflow: "hidden", minWidth: 0, width: "100%" }}
    >
      <View>
        <Animated.View style={animatedStyle}>
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
