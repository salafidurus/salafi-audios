import { useUnistyles } from "react-native-unistyles";
import { Cloud, Search, Mic, Settings, CassetteTape } from "lucide-react-native";
import { EaseView } from "react-native-ease";

export type TabIconName = "feed" | "live" | "search" | "library" | "account";

const ICONS = {
  feed: Cloud,
  live: Mic,
  search: Search,
  library: CassetteTape,
  account: Settings,
};

type TabIconProps = {
  name: TabIconName;
  focused: boolean;
  size?: number;
};

export function TabIcon({ name, focused, size = 24 }: TabIconProps) {
  const { theme } = useUnistyles();

  const Icon = ICONS[name];
  const color = focused ? theme.colors.content.primary : theme.colors.content.muted;

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
