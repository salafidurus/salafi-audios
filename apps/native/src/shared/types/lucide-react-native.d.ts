import type { ColorValue } from "react-native";

/** Defines native-only type declarations for platform and library boundaries. */
declare module "lucide-react-native" {
  interface LucideProps {
    color?: ColorValue;
    fill?: ColorValue;
  }
}
