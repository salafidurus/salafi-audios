import { ReactNode, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { initApiClient } from "@sd/core-api";
import { createQueryClient } from "@sd/core-contracts";

const queryClient = createQueryClient();

function AppFontsProvider({ children }: { children: ReactNode }) {
  const [loaded] = useFonts({
    "Fraunces-Regular": require("../assets/fonts/Fraunces-Regular.ttf"),
    "Fraunces-SemiBold": require("../assets/fonts/Fraunces-SemiBold.ttf"),
    "Fraunces-Bold": require("../assets/fonts/Fraunces-Bold.ttf"),
    "Manrope-Regular": require("../assets/fonts/Manrope-Regular.ttf"),
    "Manrope-Medium": require("../assets/fonts/Manrope-Medium.ttf"),
    "Manrope-SemiBold": require("../assets/fonts/Manrope-SemiBold.ttf"),
    "Manrope-Bold": require("../assets/fonts/Manrope-Bold.ttf"),
    "GeistMono-Regular": require("../assets/fonts/GeistMono-Regular.ttf"),
    "GeistMono-Medium": require("../assets/fonts/GeistMono-Medium.ttf"),
    "GeistMono-SemiBold": require("../assets/fonts/GeistMono-SemiBold.ttf"),
    "GeistMono-Bold": require("../assets/fonts/GeistMono-Bold.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return children;
}

type Props = {
  children: ReactNode;
};

export function ProvidersMobileNative({ children }: Props) {
  useEffect(() => {
    initApiClient();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <AppFontsProvider>{children}</AppFontsProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
