import { useUnistyles } from "react-native-unistyles";
import { Cloud, Search, Mic, Settings, BookOpen } from "lucide-react-native";
import { EaseView } from "react-native-ease";
import type { ComponentType } from "react";

export type TabIconName = "feed" | "live" | "search" | "library" | "account";

const ICONS = {
  feed: Cloud,
  live: Mic,
  search: Search,
  library: BookOpen,
  account: Settings,
};

type TabIconProps = {
  name: TabIconName;
  focused: boolean;
  size?: number;
};

export function TabIcon({ name, focused, size = 24 }: TabIconProps) {
  const { theme } = useUnistyles();
  const supportsEaseView = typeof EaseView === "function";

  const Icon = ICONS[name] as ComponentType<{
    size?: number;
    strokeWidth?: number;
    color?: string;
  }>;
  const color = focused ? theme.colors.content.primary : theme.colors.content.muted;

  if (!supportsEaseView) {
    return <Icon color={color} size={size} strokeWidth={focused ? 1.5 : 2} />;
  }

  return (
    <EaseView
      animate={{
        scale: focused ? 1.08 : 1,
        opacity: focused ? 1 : 0.72,
      }}
      transition={{
        type: "spring",
        damping: 12,
        stiffness: 120,
      }}
    >
      <Icon color={color} size={size} strokeWidth={focused ? 1.5 : 2} />
    </EaseView>
  );
}
