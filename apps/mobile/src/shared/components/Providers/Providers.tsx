import { AppFontsProvider } from "./app-fonts-provider";
import { ReactNode, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
      <QueryClientProvider client={queryClient}>
        <AppFontsProvider>{children}</AppFontsProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
