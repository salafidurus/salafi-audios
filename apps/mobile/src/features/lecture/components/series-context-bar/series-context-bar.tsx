import { View, Text, Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { SeriesContextDto } from "@sd/core-contracts";

export type SeriesContextBarNativeProps = {
  seriesContext: SeriesContextDto;
  onNavigate?: (lectureId: string) => void;
};

export function SeriesContextBarNative({ seriesContext, onNavigate }: SeriesContextBarNativeProps) {
  const { theme } = useUnistyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface.subtle,
          borderColor: theme.colors.border.subtle,
        },
      ]}
    >
      <Text style={[styles.label, { color: theme.colors.content.muted }]}>Part of series</Text>
      <Text style={[styles.title, { color: theme.colors.content.default }]}>
        {seriesContext.seriesTitle}
      </Text>

      <View style={styles.navRow}>
        {seriesContext.prevLecture ? (
          <Pressable
            onPress={() => onNavigate?.(seriesContext.prevLecture!.id)}
            style={[styles.navButton, { borderColor: theme.colors.border.default }]}
          >
            <Text style={[styles.navLabel, { color: theme.colors.content.muted }]}>← Previous</Text>
            <Text
              style={[styles.navTitle, { color: theme.colors.content.default }]}
              numberOfLines={1}
            >
              {seriesContext.prevLecture.title}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.navSpacer} />
        )}

        {seriesContext.nextLecture ? (
          <Pressable
            onPress={() => onNavigate?.(seriesContext.nextLecture!.id)}
            style={[
              styles.navButton,
              styles.navButtonRight,
              { borderColor: theme.colors.border.default },
            ]}
          >
            <Text
              style={[styles.navLabel, styles.navLabelRight, { color: theme.colors.content.muted }]}
            >
              Next →
            </Text>
            <Text
              style={[
                styles.navTitle,
                styles.navTitleRight,
                { color: theme.colors.content.default },
              ]}
              numberOfLines={1}
            >
              {seriesContext.nextLecture.title}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.navSpacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: theme.spacing.layout.sectionY,
    padding: theme.spacing.component.cardPadding,
    borderRadius: theme.radius.component.card,
    borderWidth: 1,
  },
  label: {
    ...theme.typography.caption,
  },
  title: {
    ...theme.typography.titleMd,
    marginTop: 4,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.component.gapMd,
    gap: theme.spacing.component.gapMd,
  },
  navButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: theme.radius.scale.sm,
    paddingVertical: theme.spacing.component.gapSm,
    paddingHorizontal: theme.spacing.component.gapMd,
  },
  navButtonRight: {
    alignItems: "flex-end",
  },
  navSpacer: {
    flex: 1,
  },
  navLabel: {
    ...theme.typography.xs,
  },
  navLabelRight: {
    textAlign: "right",
  },
  navTitle: {
    ...theme.typography.bodySm,
    marginTop: 2,
  },
  navTitleRight: {
    textAlign: "right",
  },
}));
