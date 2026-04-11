import { View } from "react-native";

type ProgressBarProps = {
  progressPercent: number;
};

export function ProgressBar({ progressPercent }: ProgressBarProps) {
  return (
    <View
      style={{
        height: 3,
        backgroundColor: "#e5e7eb",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${progressPercent}%`,
          backgroundColor: "#2563eb",
          borderRadius: 2,
        }}
      />
    </View>
  );
}
