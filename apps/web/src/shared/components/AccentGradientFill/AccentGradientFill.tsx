import type { CSSProperties } from "react";

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

function toPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function toAngle(start: { x: number; y: number }, end: { x: number; y: number }): string {
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI) - 90;
  return `${Math.round(angle)}deg`;
}

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
  const style: CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    borderRadius,
    backgroundImage: [
      `radial-gradient(circle at ${toPercent(radialCenter.x)} ${toPercent(radialCenter.y)}, ${radialCenterColor}, ${radialEdgeColor} ${toPercent(radialRadius)})`,
      `linear-gradient(${toAngle(linearStart, linearEnd)}, ${linearColors[0]}, ${linearColors[1]})`,
    ].join(", "),
  };

  return <div aria-hidden="true" style={style} />;
}
