import {
  initApiClient,
  setCookieProvider,
  setLocaleProvider,
  setUnauthorizedHandler,
} from "@sd/core-api";
import { createQueryClient, routes, shouldPersistQuery, DEFAULT_MAX_AGE } from "@sd/core-contracts";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
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
import { syncTypographyToLocale } from "./styles/theme/typography-sync";
import { createSqlitePersister } from "./persister";

LogBox.ignoreLogs(["API client initialization failed", "Open debugger to view warnings"]);

export const queryClient = createQueryClient();
export const persister = createSqlitePersister();

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
    "Alexandria-Regular": require("../../assets/fonts/Alexandria-Regular.ttf"),
    "Alexandria-Medium": require("../../assets/fonts/Alexandria-Medium.ttf"),
    "Alexandria-SemiBold": require("../../assets/fonts/Alexandria-SemiBold.ttf"),
    "Alexandria-Bold": require("../../assets/fonts/Alexandria-Bold.ttf"),
    "IBMPlexSansArabic-Regular": require("../../assets/fonts/IBMPlexSansArabic-Regular.ttf"),
    "IBMPlexSansArabic-Medium": require("../../assets/fonts/IBMPlexSansArabic-Medium.ttf"),
    "IBMPlexSansArabic-SemiBold": require("../../assets/fonts/IBMPlexSansArabic-SemiBold.ttf"),
    "IBMPlexSansArabic-Bold": require("../../assets/fonts/IBMPlexSansArabic-Bold.ttf"),
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

    // RN fetch has no cookie jar, so forward the @better-auth/expo session
    // cookie (kept in SecureStore) as a Cookie header on shared API calls.
    setCookieProvider(() => authClient.getCookie());

    // Send the active UI locale as Accept-Language so the API resolves
    // content translations to the user's selected language.
    setLocaleProvider(() => i18n.language);

    setUnauthorizedHandler(() => {
      authClient.signOut().then(async () => {
        queryClient.clear();
        await persister.removeClient();
        router.replace(routes.home as Href);
      });
    });
  }, [router]);

  useEffect(() => {
    void initI18n()
      .then(() => {
        setI18nReady(true);
        syncTypographyToLocale(i18n.language as "en" | "ar");
      })
      .catch((err) => {
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
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
              persister,
              maxAge: DEFAULT_MAX_AGE,
              dehydrateOptions: {
                shouldDehydrateQuery: (query: any) => shouldPersistQuery(query.queryKey),
              },
            }}
          >
            <I18nextProvider i18n={i18n}>
              <AppFontsProvider>{children}</AppFontsProvider>
            </I18nextProvider>
          </PersistQueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
