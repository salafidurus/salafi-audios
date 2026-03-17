import { useRef, useEffect, useState } from "react";
import { Animated, Text, View, type StyleProp, type TextStyle } from "react-native";

export type MarqueeTextProps = {
  text: string;
  textStyle?: StyleProp<TextStyle>;
};

export function MarqueeText({ text, textStyle }: MarqueeTextProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [containerW, setContainerW] = useState(0);
  const [textW, setTextW] = useState(0);
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    anim.current?.stop();
    scrollX.setValue(0);

    if (textW <= containerW || containerW === 0 || textW === 0) return;

    const distance = textW - containerW;
    const duration = Math.max(2000, (distance / 40) * 1000);

    anim.current = Animated.loop(
      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(scrollX, {
          toValue: -distance,
          duration,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(scrollX, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.current.start();

    return () => anim.current?.stop();
  }, [textW, containerW, scrollX]);

  return (
    <View
      style={{ overflow: "hidden" }}
      onLayout={(e) => setContainerW(e.nativeEvent.layout.width)}
    >
      {/* Hidden in a row-flex so it can expand to natural text width */}
      <View style={{ flexDirection: "row", position: "absolute", opacity: 0 }}>
        <Text style={textStyle} onLayout={(e) => setTextW(e.nativeEvent.layout.width)}>
          {text}
        </Text>
      </View>
      <Animated.Text style={[textStyle, { transform: [{ translateX: scrollX }] }]}>
        {text}
      </Animated.Text>
    </View>
  );
}
