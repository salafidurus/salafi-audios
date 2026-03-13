import { AppFontsProvider } from "./app-fonts-provider";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return <AppFontsProvider>{children}</AppFontsProvider>;
}
