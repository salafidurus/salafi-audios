import { useId } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";

type AccentGradientFillProps = {
  borderRadius: number | string;
  linearColors: [string, string];
  linearStart: { x: number; y: number };
  linearEnd: { x: number; y: number };
  radialCenter: { x: number; y: number };
  radialRadius: number;
  radialCenterColor: string;
  radialEdgeColor: string;
};

export function AccentGradientFill({
  borderRadius,
  linearColors,
  linearStart,
  linearEnd,
  radialCenter,
  radialRadius,
  radialCenterColor,
  radialEdgeColor,
}: AccentGradientFillProps) {
  const gradientId = useId().replace(/[:]/g, "");
  const linearId = `${gradientId}-linear`;
  const radialId = `${gradientId}-radial`;

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, styles.container, { borderRadius }]}
    >
      <Svg width="100%" height="100%">
        {/* @ts-expect-error react-native-svg accepts children for Defs at runtime */}
        <Defs>
          <LinearGradient
            id={linearId}
            x1={`${linearStart.x * 100}%`}
            y1={`${linearStart.y * 100}%`}
            x2={`${linearEnd.x * 100}%`}
            y2={`${linearEnd.y * 100}%`}
          >
            <Stop offset="0%" stopColor={linearColors[0]} />
            <Stop offset="100%" stopColor={linearColors[1]} />
          </LinearGradient>
          <RadialGradient
            id={radialId}
            cx={`${radialCenter.x * 100}%`}
            cy={`${radialCenter.y * 100}%`}
            rx={`${radialRadius * 100}%`}
            ry={`${radialRadius * 100}%`}
          >
            <Stop offset="0%" stopColor={radialCenterColor} stopOpacity="0.58" />
            <Stop offset="100%" stopColor={radialEdgeColor} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${linearId})`} />
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${radialId})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
