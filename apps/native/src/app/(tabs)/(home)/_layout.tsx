import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { getTabStackScreenOptions } from "@/features/navigation/utils/stack-header-options";

export default function HomeLayout() {
  const { theme } = useUnistyles();

  return (
    <Stack screenOptions={getTabStackScreenOptions(theme)}>
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
    </Stack>
  );
}
