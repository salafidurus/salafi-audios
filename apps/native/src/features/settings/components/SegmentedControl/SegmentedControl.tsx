import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, isActive && styles.activeSegment]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: theme.radius.scale.sm,
    padding: theme.spacing.scale.xs,
    alignSelf: "flex-start",
  },
  segment: {
    paddingVertical: theme.spacing.scale.xs,
    paddingHorizontal: theme.spacing.scale.md,
    borderRadius: theme.radius.scale.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  activeSegment: {
    backgroundColor: theme.colors.surface.default,
    ...theme.shadows.sm,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.content.muted,
  },
  activeLabel: {
    color: theme.colors.content.strong,
    fontWeight: "600",
  },
}));
