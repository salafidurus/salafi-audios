import { Text, View } from "react-native";

type Props = {
  description: string;
  title: string;
};

export function PlaceholderRouteScreen({ description, title }: Props) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700", textAlign: "center" }}>{title}</Text>
      <Text style={{ fontSize: 16, textAlign: "center", color: "#475569" }}>{description}</Text>
    </View>
  );
}
