import { View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

interface ScreenViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  center?: boolean;
}

export function ScreenView({ children, style, center }: ScreenViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }, style]}>
      <View style={[styles.content, center && styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create((_theme) => ({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
}));
