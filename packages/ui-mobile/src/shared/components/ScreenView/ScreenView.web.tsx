import { type ViewStyle } from "react-native";
import { View } from "react-native-unistyles/components/native/View";
import { StyleSheet } from "react-native-unistyles";

export interface ScreenViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  center?: boolean;
}

export function ScreenView({ children, style, contentStyle, center }: ScreenViewProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.content, center && styles.center, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
    _web: {
      paddingHorizontal: theme.spacing.layout.pageX,
      paddingVertical: theme.spacing.layout.pageY,
    },
  },
  content: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
  },
}));
