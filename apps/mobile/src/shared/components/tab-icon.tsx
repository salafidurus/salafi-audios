import { useUnistyles } from "react-native-unistyles";

import { Home, Radio, Search, Library, User } from "lucide-react-native";

export type TabIconName = "house" | "radio" | "search" | "library" | "user";

const ICONS = {
  house: Home,
  radio: Radio,
  search: Search,
  library: Library,
  user: User,
};

type TabIconProps = {
  name: TabIconName;
  focused: boolean;
  size?: number;
};

export function TabIcon({ name, focused, size = 24 }: TabIconProps) {
  const { theme } = useUnistyles();

  const activeColor = theme.colors.primary;
  const inactiveColor = theme.colors.textMuted;
  const Icon = ICONS[name];

  return (
    <Icon
      color={focused ? activeColor : inactiveColor}
      size={size}
      strokeWidth={focused ? 1 : 2}
      absoluteStrokeWidth={true}
      fill={focused ? activeColor : "none"}
    />
  );
}
