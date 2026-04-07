import { View, Text, Pressable, ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ScholarChipDto, ContentSuggestionDto, RecentProgressDto } from "@sd/core-contracts";
import { BrowseCard } from "../BrowseCard/BrowseCard.native";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export type QuickBrowseProps = {
  scholars?: ScholarChipDto[];
  suggestions?: ContentSuggestionDto[];
  recentProgress?: RecentProgressDto | null;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (slug: string) => void;
  onContinueListening?: (lectureSlug: string) => void;
  onSelectCategory?: (searchKey: string) => void;
};

export function QuickBrowse({
  scholars,
  suggestions,
  recentProgress,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
  onSelectCategory,
}: QuickBrowseProps) {
  const showFallback =
    (!scholars || scholars.length === 0) && (!suggestions || suggestions.length === 0);

  return (
    <View style={styles.root}>
      {/* Continue Listening */}
      {recentProgress && (
        <View style={styles.section}>
          <Text style={styles.header}>Continue Listening</Text>
          <Pressable
            onPress={() => onContinueListening?.(recentProgress.lectureSlug)}
            style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}
          >
            <Text style={styles.continueTitle}>{recentProgress.lectureTitle}</Text>
            <Text style={styles.continueScholar}>{recentProgress.scholarName}</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${recentProgress.durationSeconds > 0 ? Math.round((recentProgress.positionSeconds / recentProgress.durationSeconds) * 100) : 0}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressTime}>
                {formatDuration(recentProgress.positionSeconds)} /{" "}
                {formatDuration(recentProgress.durationSeconds)}
              </Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* Scholars */}
      {scholars && scholars.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.header}>Scholars</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.scholarRow}>
              {scholars.map((scholar) => (
                <Pressable
                  key={scholar.id}
                  onPress={() => onSelectScholar?.(scholar.slug)}
                  style={({ pressed }) => [styles.scholarChip, pressed && styles.pressed]}
                >
                  <View style={styles.scholarAvatar}>
                    <Text style={styles.scholarInitial}>{scholar.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.scholarName} numberOfLines={1}>
                    {scholar.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.header}>Suggestions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.suggestionsRow}>
              {suggestions.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => onSelectSuggestion?.(item.slug)}
                  style={({ pressed }) => [styles.suggestionCard, pressed && styles.pressed]}
                >
                  <Text style={styles.suggestionTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.suggestionScholar} numberOfLines={1}>
                    {item.scholarName}
                  </Text>
                  <View style={styles.suggestionMeta}>
                    <View style={styles.kindBadge}>
                      <Text style={styles.kindText}>{item.kind}</Text>
                    </View>
                    {item.durationSeconds != null && (
                      <Text style={styles.durationText}>
                        {formatDuration(item.durationSeconds)}
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Fallback: Browse All */}
      {showFallback && (
        <View>
          <Text style={styles.header}>Browse all</Text>
          <View style={styles.grid}>
            {(["Senior Scholars", "Hadith", "Fiqh", "Tafsir"] as const).map((name) => (
              <View key={name} style={styles.cardWrapper}>
                <BrowseCard name={name} onPress={() => onSelectCategory?.(name)} />
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    width: "100%",
    gap: theme.spacing.component.gapXl,
  },
  section: {
    gap: theme.spacing.component.gapMd,
  },
  header: {
    color: theme.colors.content.strong,
    ...theme.typography.titleMd,
  },
  pressed: {
    opacity: 0.82,
  },

  // Continue Listening
  continueCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.card,
    backgroundColor: theme.colors.surface.default,
    padding: theme.spacing.component.cardPadding,
    gap: theme.spacing.scale.xs,
  },
  continueTitle: {
    color: theme.colors.content.strong,
    ...theme.typography.labelMd,
  },
  continueScholar: {
    color: theme.colors.content.muted,
    ...theme.typography.caption,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.sm,
    marginTop: theme.spacing.scale.xs,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surface.hover,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: theme.colors.action.primary,
  },
  progressTime: {
    color: theme.colors.content.muted,
    ...theme.typography.caption,
  },

  // Scholars
  scholarRow: {
    flexDirection: "row",
    gap: theme.spacing.component.gapMd,
  },
  scholarChip: {
    alignItems: "center",
    gap: theme.spacing.scale.xs,
  },
  scholarAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface.default,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  scholarInitial: {
    color: theme.colors.content.muted,
    ...theme.typography.labelMd,
  },
  scholarName: {
    maxWidth: 72,
    textAlign: "center",
    color: theme.colors.content.default,
    ...theme.typography.caption,
  },

  // Suggestions
  suggestionsRow: {
    flexDirection: "row",
    gap: theme.spacing.component.gapMd,
  },
  suggestionCard: {
    width: 160,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.card,
    backgroundColor: theme.colors.surface.default,
    padding: theme.spacing.component.cardPadding,
    gap: theme.spacing.scale.xs,
  },
  suggestionTitle: {
    color: theme.colors.content.strong,
    ...theme.typography.labelMd,
  },
  suggestionScholar: {
    color: theme.colors.content.muted,
    ...theme.typography.caption,
  },
  suggestionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.xs,
  },
  kindBadge: {
    backgroundColor: theme.colors.surface.hover,
    borderRadius: theme.radius.component.chip,
    paddingHorizontal: theme.spacing.scale.xs,
    paddingVertical: 1,
  },
  kindText: {
    color: theme.colors.content.muted,
    ...theme.typography.caption,
  },
  durationText: {
    color: theme.colors.content.muted,
    ...theme.typography.caption,
  },

  // Fallback grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.component.gapMd,
    marginTop: theme.spacing.component.gapMd,
  },
  cardWrapper: {
    width: "48%",
  },
}));
