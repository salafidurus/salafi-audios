import type { ColorValue } from "react-native";

declare module "lucide-react-native" {
  interface LucideProps {
    color?: ColorValue;
    fill?: ColorValue;
  }
}
