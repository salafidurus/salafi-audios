import type { ColorValue } from "react-native";

/** Provides the native shared types lucide-react-native.d module responsibility. */
declare module "lucide-react-native" {
  interface LucideProps {
    color?: ColorValue;
    fill?: ColorValue;
  }
}
