import { View, Text, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";
import type { ScholarChipDto, ContentSuggestionDto, RecentProgressDto } from "@sd/core-contracts";

const SCHOLAR_SKELETON_COUNT = 5;
const SUGGESTION_SKELETON_COUNT = 3;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export type QuickBrowseProps = {
  scholars?: ScholarChipDto[];
  suggestions?: ContentSuggestionDto[];
  recentProgress?: RecentProgressDto | null;
  isLoading?: boolean;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (slug: string) => void;
  onContinueListening?: (lectureSlug: string) => void;
  onSelectCategory?: (searchKey: string) => void;
};

export function QuickBrowse({
  scholars,
  suggestions,
  recentProgress,
  isLoading,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
}: QuickBrowseProps) {
  return (
    <View style={styles.root}>
      {/* Continue Listening */}
      {recentProgress != null && (
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
                    {scholar.imageUrl ? (
                      <Image
                        source={{ uri: scholar.imageUrl }}
                        style={styles.scholarAvatarImage}
                        contentFit="cover"
                      />
                    ) : (
                      <Text style={styles.scholarInitial}>{scholar.name.charAt(0)}</Text>
                    )}
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

      {/* Scholars skeleton */}
      {isLoading && (!scholars || scholars.length === 0) && (
        <View style={styles.section}>
          <Text style={styles.header}>Scholars</Text>
          <View style={styles.scholarRow}>
            {Array.from({ length: SCHOLAR_SKELETON_COUNT }).map((_, index) => (
              <View key={index} style={styles.scholarChip}>
                <View style={[styles.scholarAvatar, styles.skeletonBlock]} />
                <View style={styles.scholarNameSkeleton} />
              </View>
            ))}
          </View>
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

      {/* Suggestions skeleton */}
      {isLoading && (!suggestions || suggestions.length === 0) && (
        <View style={styles.section}>
          <Text style={styles.header}>Suggestions</Text>
          <View style={styles.suggestionsRow}>
            {Array.from({ length: SUGGESTION_SKELETON_COUNT }).map((_, index) => (
              <View key={index} style={[styles.suggestionCard, styles.skeletonBlock]}>
                <View style={styles.skeletonLineLg} />
                <View style={styles.skeletonLineSm} />
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
  scholarAvatarImage: {
    width: "100%",
    height: "100%",
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
  scholarNameSkeleton: {
    width: 48,
    height: 10,
    borderRadius: theme.radius.component.chip,
    backgroundColor: theme.colors.surface.hover,
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

  // Skeletons
  skeletonBlock: {
    backgroundColor: theme.colors.surface.hover,
  },
  skeletonLineLg: {
    height: 14,
    borderRadius: theme.radius.component.chip,
    backgroundColor: theme.colors.surface.default,
    marginBottom: theme.spacing.scale.xs,
  },
  skeletonLineSm: {
    height: 10,
    width: "60%",
    borderRadius: theme.radius.component.chip,
    backgroundColor: theme.colors.surface.default,
  },
}));
