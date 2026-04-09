import { ReactNode, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { I18nextProvider } from "react-i18next";
import { initApiClient } from "@sd/core-api";
import { createQueryClient } from "@sd/core-contracts";
import { getApiBaseUrl } from "./config/env";
import i18n, { initI18n } from "./i18n/i18n";

const queryClient = createQueryClient();

function AppFontsProvider({ children }: { children: ReactNode }) {
  const [loaded] = useFonts({
    "Fraunces-Regular": require("../../assets/fonts/Fraunces-Regular.ttf"),
    "Fraunces-SemiBold": require("../../assets/fonts/Fraunces-SemiBold.ttf"),
    "Fraunces-Bold": require("../../assets/fonts/Fraunces-Bold.ttf"),
    "Manrope-Regular": require("../../assets/fonts/Manrope-Regular.ttf"),
    "Manrope-Medium": require("../../assets/fonts/Manrope-Medium.ttf"),
    "Manrope-SemiBold": require("../../assets/fonts/Manrope-SemiBold.ttf"),
    "Manrope-Bold": require("../../assets/fonts/Manrope-Bold.ttf"),
    "GeistMono-Regular": require("../../assets/fonts/GeistMono-Regular.ttf"),
    "GeistMono-Medium": require("../../assets/fonts/GeistMono-Medium.ttf"),
    "GeistMono-SemiBold": require("../../assets/fonts/GeistMono-SemiBold.ttf"),
    "GeistMono-Bold": require("../../assets/fonts/GeistMono-Bold.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return children;
}

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    const baseUrl = getApiBaseUrl();
    if (baseUrl) {
      initApiClient({ baseUrl });
    } else {
      initApiClient();
    }
  }, []);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  if (!i18nReady) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <QueryClientProvider client={queryClient}>
              <AppFontsProvider>{children}</AppFontsProvider>
            </QueryClientProvider>
          </KeyboardProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </I18nextProvider>
  );
}
