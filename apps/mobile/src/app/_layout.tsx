import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";
import { Providers } from "@/shared/components/Providers";

// Initialize Sentry for error tracking and performance monitoring
import * as Sentry from "@sentry/react-native";
Sentry.init({
  dsn: "https://4445df83460127446c2cb16e21099067@o4511025480990720.ingest.us.sentry.io/4511025777016832",
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,
});

function RootLayout() {
  const { theme } = useUnistyles();
  return (
    <Providers>
      <StatusBar style="auto" />
      <Stack
        initialRouteName="(tabs)"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface.default,
          },
          headerTitleStyle: {
            color: theme.colors.content.default,
          },
          headerTintColor: theme.colors.content.default,
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      </Stack>
    </Providers>
  );
}

export default Sentry.wrap(RootLayout);
