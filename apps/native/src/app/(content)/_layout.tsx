import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

export default function ContentLayout() {
  const { theme } = useUnistyles();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: true,
        headerStyle: {
          backgroundColor: theme.colors.surface.default,
        },
        headerTintColor: theme.colors.content.strong,
        headerShadowVisible: false,
        headerTitle: "",
      }}
    />
  );
}
