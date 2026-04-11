import { type ReactNode, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { I18nextProvider } from "react-i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createQueryClient } from "@sd/core-contracts/query";
import { initApiClient } from "@sd/core-contracts/query/hooks";
import { getApiBaseUrl } from "./config/runtime-env";
import { i18n, initI18n } from "./i18n/i18n";

const queryClient = createQueryClient();

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    const baseUrl = getApiBaseUrl();

    if (baseUrl) {
      initApiClient({ baseUrl });
    }
  }, []);

  useEffect(() => {
    void initI18n().then(() => setI18nReady(true));
  }, []);

  if (!i18nReady) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          </KeyboardProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </I18nextProvider>
  );
}
