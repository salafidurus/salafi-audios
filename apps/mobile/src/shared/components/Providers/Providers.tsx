import { AppFontsProvider } from "./app-fonts-provider";
import { ReactNode, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
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
    <QueryClientProvider client={queryClient}>
      <AppFontsProvider>{children}</AppFontsProvider>
    </QueryClientProvider>
  );
}
