import { AppFontsProvider } from "./app-fonts-provider";
import { ReactNode, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { initApiClient } from "@sd/ui-mobile";
import { createQueryClient } from "@sd/contracts/query";
const queryClient = createQueryClient();

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  useEffect(() => {
    initApiClient();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <AppFontsProvider>{children}</AppFontsProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
