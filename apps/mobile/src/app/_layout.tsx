import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";
import { Providers } from "@sd/shared";
import { getWrappedLayout, initIntegrations } from "@sd/core-config";
import { useEffect } from "react";

function RootLayout() {
  const { theme } = useUnistyles();

  useEffect(() => {
    initIntegrations();
  }, []);

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
        <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      </Stack>
    </Providers>
  );
}

export default getWrappedLayout(RootLayout);
