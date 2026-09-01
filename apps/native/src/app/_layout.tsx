import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { getWrappedLayout } from "@/core/integrations";
import { BottomAccessory, SearchPaletteProvider } from "@/features/navigation";

import { Providers } from "../core/providers";

/** Defines the Expo Router entrypoint for the native _layout route and delegates behavior to the feature layer. */
function RootLayout() {
  return (
    <Providers>
      <StatusBar style="auto" />
      <SearchPaletteProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="(content)" options={{ presentation: "formSheet" }} />
          <Stack.Screen name="(auth)" options={{ presentation: "formSheet" }} />
        </Stack>
        <BottomAccessory />
      </SearchPaletteProvider>
    </Providers>
  );
}

const WrappedLayout = getWrappedLayout(RootLayout);
export default WrappedLayout;
