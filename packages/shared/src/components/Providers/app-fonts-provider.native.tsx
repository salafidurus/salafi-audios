import { ReactNode } from "react";
import { useFonts } from "expo-font";

type Props = {
  children: ReactNode;
};

export function AppFontsProvider({ children }: Props) {
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
