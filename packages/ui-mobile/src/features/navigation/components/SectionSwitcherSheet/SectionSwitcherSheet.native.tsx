import { Pressable, Text, View } from "react-native";
import { useCallback, type ComponentType } from "react";
import * as Haptics from "expo-haptics";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Cloud, Mic, CassetteTape, Settings, Search } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { Section } from "../../types";

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;

type SwitcherItem = {
  id: Section | "home";
  label: string;
  Icon: IconComponent;
};

const ALL_ITEMS: SwitcherItem[] = [
  { id: "home", label: "Home", Icon: Search as IconComponent },
  { id: "feed", label: "Feed", Icon: Cloud as IconComponent },
  { id: "live", label: "Live", Icon: Mic as IconComponent },
  { id: "library", label: "Library", Icon: CassetteTape as IconComponent },
  { id: "account", label: "Account", Icon: Settings as IconComponent },
];

type Props = {
  currentSection: Section;
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  onSelect: (target: Section | "home") => void;
};

export function SectionSwitcherSheet({ currentSection, bottomSheetRef, onSelect }: Props) {
  const { theme } = useUnistyles();

  const items = ALL_ITEMS.filter((item) => item.id !== currentSection);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  const handleSelect = (target: Section | "home") => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    bottomSheetRef.current?.close();
    onSelect(target);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={[280]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: theme.colors.surface.elevated,
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.content.muted,
      }}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.content.strong }]}>Switch to</Text>
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handleSelect(item.id)}
            style={styles.item}
            accessibilityLabel={`Navigate to ${item.label}`}
            accessibilityRole="button"
          >
            <item.Icon color={theme.colors.content.muted} size={20} strokeWidth={2} />
            <Text style={[styles.itemLabel, { color: theme.colors.content.primary }]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingTop: theme.spacing.scale.sm,
    gap: theme.spacing.scale.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: theme.spacing.scale.xs,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.md,
    paddingHorizontal: theme.spacing.scale.sm,
    borderRadius: theme.radius.component.chip,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
}));
