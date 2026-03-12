import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

export default function RootLayout() {
  const { theme } = useUnistyles();
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        initialRouteName="(tabs)"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.bg,
          },
          headerTitleStyle: {
            color: theme.colors.text,
          },
          headerTintColor: theme.colors.text,
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      </Stack>
    </>
  );
}
