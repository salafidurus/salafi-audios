import { initApiClient, setUnauthorizedHandler } from "@sd/core-api";
import { createQueryClient, routes } from "@sd/core-contracts";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { type Href, useRouter } from "expo-router";
import { type ReactNode, useEffect, useState } from "react";
import { authClient } from "./auth/auth-client";
import { I18nextProvider } from "react-i18next";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getApiBaseUrl } from "./config/runtime-env";
import { i18n, initI18n } from "./i18n/i18n";

LogBox.ignoreLogs(["API client initialization failed", "Open debugger to view warnings"]);

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
  const router = useRouter();

  useEffect(() => {
    const baseUrl = getApiBaseUrl();
    if (baseUrl) {
      initApiClient({ baseUrl });
    } else {
      initApiClient();
    }

    setUnauthorizedHandler(() => {
      authClient.signOut().then(() => {
        router.replace(routes.home as Href);
      });
    });
    // react-doctor-disable-next-line react-doctor/exhaustive-deps
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void initI18n()
      .then(() => setI18nReady(true))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[i18n] init failed, falling back to default:", err);
        setI18nReady(true);
      });
  }, []);

  if (!i18nReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <I18nextProvider i18n={i18n}>
              <AppFontsProvider>{children}</AppFontsProvider>
            </I18nextProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
