import type { StyleProp, ViewStyle } from "react-native";

import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
};

export function Skeleton({ width = "100%", height = 16, style, borderRadius }: SkeletonProps) {
  const { theme } = useUnistyles();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + shimmer.value * 0.3,
  }));

  const borderRadiusValue =
    borderRadius ??
    (typeof width === "number" && typeof height === "number" && width === height
      ? theme.radius.scale.full
      : theme.radius.scale.sm);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius: borderRadiusValue },
        animatedStyle,
        style,
      ]}
    >
      <View style={[styles.shimmerOverlay, { backgroundColor: theme.colors.surface.hover }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  skeleton: {
    backgroundColor: theme.colors.surface.subtle,
    overflow: "hidden",
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
}));
