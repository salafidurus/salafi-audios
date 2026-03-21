import { Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Cloud, Mic, CassetteTape, Settings } from "lucide-react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { Section } from "../../types";
import type { ComponentType } from "react";

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;

type SectionItem = {
  section: Section;
  label: string;
  Icon: IconComponent;
};

type Props = {
  onSelectSection: (section: Section) => void;
};

const SECTIONS: SectionItem[] = [
  { section: "feed", label: "Feed", Icon: Cloud as IconComponent },
  { section: "live", label: "Live", Icon: Mic as IconComponent },
  { section: "library", label: "Library", Icon: CassetteTape as IconComponent },
  { section: "account", label: "Account", Icon: Settings as IconComponent },
];

export function SectionLauncher({ onSelectSection }: Props) {
  const { theme } = useUnistyles();

  const handlePress = (section: Section) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelectSection(section);
  };

  return (
    <View style={styles.container}>
      {SECTIONS.map((item) => (
        <Pressable
          key={item.section}
          onPress={() => handlePress(item.section)}
          style={styles.button}
          accessibilityLabel={`Navigate to ${item.label}`}
          accessibilityRole="button"
        >
          <EaseView
            animate={{ scale: 1, opacity: 0.72 }}
            transition={{ type: "spring", damping: 10, stiffness: 200 }}
          >
            <item.Icon color={theme.colors.content.muted} size={26} strokeWidth={2} />
          </EaseView>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    flex: 1,
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.scale.sm,
  },
}));
