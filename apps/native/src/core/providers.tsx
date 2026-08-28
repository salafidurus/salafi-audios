import {
  initApiClient,
  setCookieProvider,
  setLocaleProvider,
  setUnauthorizedHandler,
} from "@sd/core-api";
import { routes, queryKeys } from "@sd/core-contracts";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { type ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { AppState, type AppStateStatus, LogBox, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { handleDownloadOutboxEntry } from "@/features/downloads/engine/download.engine";
import { drainDownloadsOutbox } from "@/features/downloads/outbox/outbox.drain";
import { useDownloadsStore } from "@/features/downloads/store/downloads.store";

import { initProgressPersistence } from "./audio/progress-persistence";
import { authClient } from "./auth/auth-client";
import { useAuth } from "./auth/use-auth";
import { getApiBaseUrl } from "./config/runtime-env";
import { i18n, initI18n } from "./i18n/i18n";
import { initIntegrations } from "./integrations";
import { onNetworkReconnect } from "./network/network-status";
import { queryClient } from "./query-client";
import {
  applyThemePreference,
  getStoredThemePreference,
  subscribeToSystemTheme,
} from "./styles/theme/theme-preference";
import { syncTypographyToLocale } from "./styles/theme/typography-sync";

/** Composes the native provider tree and establishes app-wide runtime dependencies. */
LogBox.ignoreLogs(["API client initialization failed", "Open debugger to view warnings"]);

function getSupportedLocale(locale: string): "en" | "ar" {
  return locale === "ar" ? "ar" : "en";
}

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

function RootDirectionView({ children }: { children: ReactNode }) {
  const { theme } = useUnistyles();

  return (
    <View key={theme.direction} style={styles.directionContainer}>
      {children}
    </View>
  );
}

// Initialize integrations & API client at module load time to prevent race conditions during hydration/mount
initIntegrations();
const defaultBaseUrl = getApiBaseUrl();
if (defaultBaseUrl) {
  initApiClient({ baseUrl: defaultBaseUrl });
} else {
  initApiClient();
}

type Props = {
  children: ReactNode;
  apiBaseUrl?: string;
};

/** Defines the native providers contract used by this module. */
export function Providers({ children, apiBaseUrl }: Props) {
  const [i18nReady, setI18nReady] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  // Synchronously configure API client on first render if a custom apiBaseUrl is provided (e.g. in tests/Storybook)
  useState(() => {
    if (apiBaseUrl) {
      initApiClient({ baseUrl: apiBaseUrl });
    }
  });

  useEffect(() => {
    let active = true;
    let preference: "system" | "light" | "dark" = "system";

    void getStoredThemePreference().then((storedPreference) => {
      if (!active) return;
      preference = storedPreference;
      applyThemePreference(preference);
      setThemeReady(true);
    });

    const unsubscribeAppearance = subscribeToSystemTheme(() => {
      if (preference === "system") applyThemePreference(preference);
    });

    return () => {
      active = false;
      unsubscribeAppearance();
    };
  }, []);

  useEffect(() => {
    // RN fetch has no cookie jar, so forward the @better-auth/expo session
    // cookie (kept in SecureStore) as a Cookie header on shared API calls.
    setCookieProvider(() => authClient.getCookie());

    // Send the active UI locale as Accept-Language so the API resolves
    // content translations to the user's selected language.
    setLocaleProvider(() => i18n.language);

    setUnauthorizedHandler(() => {
      authClient
        .signOut()
        .catch(() => {
          // Ignore network errors during signout
        })
        .finally(() => {
          queryClient.clear();
          router.replace(routes.home);
        });
    });
  }, [router]);

  // Must run after the initApiClient effect above — httpClient throws until
  // configureApiClient() has been called, and effects fire in declaration order.
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    return initProgressPersistence(user.id, {
      onFlushed: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.myLibrary.all });
      },
    });
  }, [isAuthenticated, user?.id]);

  // Downloads are device-scoped (not per-user), so this runs once regardless
  // of auth state: hydrate the read-cache from the SQLite registry, then wire
  // both drain triggers for the persisted outbox (offline-initiated download
  // intent, retried once connectivity/foreground returns).
  useEffect(() => {
    void useDownloadsStore.getState().actions.hydrate();

    const drain = () => {
      void drainDownloadsOutbox(handleDownloadOutboxEntry);
    };

    const unsubscribeNetwork = onNetworkReconnect(drain);
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") drain();
    };
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      unsubscribeNetwork();
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    void initI18n()
      .then(() => {
        setI18nReady(true);
        syncTypographyToLocale(getSupportedLocale(i18n.language));
      })
      .catch((err) => {
        console.warn("[i18n] init failed, falling back to default:", err);
        setI18nReady(true);
      });
  }, []);

  if (!i18nReady || !themeReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <I18nextProvider i18n={i18n}>
              <AppFontsProvider>
                <RootDirectionView>{children}</RootDirectionView>
              </AppFontsProvider>
            </I18nextProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    direction: theme.direction,
  },
  directionContainer: {
    flex: 1,
    direction: theme.direction,
  },
}));
