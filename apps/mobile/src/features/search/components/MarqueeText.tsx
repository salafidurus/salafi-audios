import { Text, View, ScrollView, type StyleProp, type TextStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { useRef, useState } from "react";

type MarqueeTextProps = {
  text: string;
  textStyle?: StyleProp<TextStyle>;
  speed?: number; // pixels per second
  pauseMs?: number; // pause at each end before reversing
};

export function MarqueeText({ text, textStyle, speed = 60, pauseMs = 1000 }: MarqueeTextProps) {
  // Refs — mutable, always current, never trigger re-render
  const twRef = useRef(0);
  const cwRef = useRef(0);

  // Plain state — safe to read during render
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [textNodeWidth, setTextNodeWidth] = useState(0);

  const offset = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -offset.value }],
  }));

  function tryStartBounce() {
    const tw = twRef.current;
    const cw = cwRef.current;

    // Wait until both measurements have arrived
    if (!tw || !cw) return;

    cancelAnimation(offset);
    offset.value = 0;

    const distance = tw - cw;

    if (distance <= 0) {
      setIsOverflowing(false);
      return;
    }

    setIsOverflowing(true);
    setTextNodeWidth(tw);

    const duration = (distance / speed) * 1000;

    offset.value = withRepeat(
      withSequence(
        withDelay(pauseMs, withTiming(distance, { duration, easing: Easing.inOut(Easing.ease) })),
        withDelay(pauseMs, withTiming(0, { duration, easing: Easing.inOut(Easing.ease) })),
      ),
      -1,
      false,
    );
  }

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        cwRef.current = e.nativeEvent.layout.width;
        tryStartBounce();
      }}
    >
      {/* Hidden ScrollView — measures natural unconstrained text width */}
      <ScrollView horizontal style={styles.hidden} pointerEvents="none" scrollEnabled={false}>
        <Text
          numberOfLines={1}
          style={textStyle}
          onLayout={(e) => {
            twRef.current = e.nativeEvent.layout.width;
            tryStartBounce();
          }}
        >
          {text}
        </Text>
      </ScrollView>

      <Animated.Text
        numberOfLines={1}
        ellipsizeMode="clip"
        style={[textStyle, isOverflowing ? { width: textNodeWidth } : undefined, animStyle]}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  hidden: {
    opacity: 0,
    position: "absolute",
    zIndex: -1,
  },
});
