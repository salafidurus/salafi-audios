import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";
import { Providers } from "@/shared/components/Providers";
import { getWrappedLayout, initIntegrations } from "@sd/ui-mobile";

initIntegrations();

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

export default getWrappedLayout(RootLayout);
