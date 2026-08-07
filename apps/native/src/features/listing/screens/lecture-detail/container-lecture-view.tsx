import type { ListingContentsDto, ListingDetailDto } from "@sd/core-contracts";

import { buildTrackQueue } from "@sd/domain-audio";
import { markSaved, markUnsaved, useIsSaved } from "@sd/domain-content";
import { Bookmark, Play } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { audioService } from "@/features/audio";
import { ListingContentView } from "@/features/listing/components/listing-content-view/listing-content-view";
import { AppText } from "@/shared/components/AppText/AppText";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

type ContainerLectureViewProps = {
  lecture: ListingDetailDto;
  title: string;
  ownContents: ListingContentsDto | undefined;
  anchor: string | undefined;
};

export function ContainerLectureView({
  lecture,
  title,
  ownContents,
  anchor,
}: ContainerLectureViewProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const isSaved = useIsSaved(lecture.id);

  const primaryTopic = lecture.topics?.[0];
  const initials = title.trim().charAt(0).toUpperCase();
  const lessonCount =
    ownContents?.format === "collection"
      ? ownContents.modules.flatMap((m) => m.lessons).length
      : (ownContents?.items.length ?? 0);

  const handlePlayAll = async () => {
    if (!ownContents) return;
    const listingRef = {
      id: lecture.id,
      title,
      format: lecture.format,
      scholarName: lecture.scholar.name,
      scholarSlug: lecture.scholar.slug,
      artworkUrl: lecture.scholar.imageUrl ?? undefined,
    };
    const queue = buildTrackQueue(listingRef, ownContents);
    if (queue.length > 0) {
      await audioService.playListing(queue[0]!, queue);
    }
  };

  const handleToggleSave = () => {
    if (isSaved) {
      markUnsaved(lecture.id, lecture.slug);
    } else {
      markSaved(lecture.id, lecture.slug);
    }
  };

  return (
    <ScreenView>
      {/* Header: Cover left + badge/title/scholar right */}
      <View style={styles.header}>
        <View style={styles.coverBox}>
          <AppText variant="displayMd" style={styles.initial}>
            {initials}
          </AppText>
        </View>

        <View style={styles.meta}>
          {primaryTopic ? (
            <View style={styles.categoryBadge}>
              <AppText variant="xs" style={styles.categoryBadgeText}>
                {primaryTopic.name.toUpperCase()}
              </AppText>
            </View>
          ) : null}
          <AppText variant="titleMd" style={styles.title} numberOfLines={3}>
            {title}
          </AppText>
          <AppText variant="caption" color="subtle" style={styles.scholar} numberOfLines={1}>
            {lecture.scholar.name}
          </AppText>
        </View>
      </View>

      {/* Play All + Bookmark */}
      <View style={styles.actions}>
        <Pressable
          onPress={handlePlayAll}
          style={styles.playAllBtn}
          accessibilityRole="button"
          accessibilityLabel={t("lecture.playAll", "Play All")}
        >
          <Play
            size={14}
            color={theme.colors.content.onPrimary}
            fill={theme.colors.content.onPrimary}
          />
          <AppText variant="labelMd" style={styles.playAllText}>
            {t("lecture.playAll", "Play All")}
          </AppText>
        </Pressable>
        <Pressable
          onPress={handleToggleSave}
          style={styles.bookmarkBtn}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? t("lecture.unsave", "Unsave") : t("lecture.save", "Save")}
        >
          <Bookmark
            size={16}
            color={isSaved ? theme.colors.action.primary : theme.colors.content.subtle}
            fill={isSaved ? theme.colors.action.primary : "none"}
          />
        </Pressable>
      </View>

      {/* Lesson count label */}
      {ownContents ? (
        <AppText variant="xs" style={styles.lessonCountLabel}>
          {`${lessonCount} ${lessonCount === 1 ? t("lecture.lessonSingular", "LESSON") : t("lecture.lessonPlural", "LESSONS")}`}
        </AppText>
      ) : null}

      {/* Lesson list */}
      {ownContents ? (
        <ListingContentView
          contents={ownContents}
          listingRef={{
            id: lecture.id,
            title,
            format: lecture.format,
            scholarName: lecture.scholar.name,
            scholarSlug: lecture.scholar.slug,
            artworkUrl: lecture.scholar.imageUrl ?? undefined,
          }}
          highlightItemId={anchor}
        />
      ) : (
        <EmptyState message={t("lecture.loading", "Loading lessons…")} variant="loading" />
      )}
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingTop: theme.spacing.layout.pageY,
    paddingBottom: 4,
  },
  coverBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: theme.colors.surface.primarySubtle,
    borderWidth: 1,
    borderColor: `${theme.colors.action.primary}55`,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  initial: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.action.primary,
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: `${theme.colors.action.primary}22`,
    borderWidth: 1,
    borderColor: `${theme.colors.action.primary}44`,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: theme.colors.action.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    color: theme.colors.content.strong,
  },
  scholar: {
    fontSize: 12.5,
    color: theme.colors.content.subtle,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingTop: 16,
    paddingBottom: 4,
  },
  playAllBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    borderRadius: 999,
    backgroundColor: theme.colors.action.primary,
  },
  playAllText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: theme.colors.content.onPrimary,
  },
  bookmarkBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  lessonCountLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: theme.colors.content.muted,
    textTransform: "uppercase",
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingTop: 20,
    paddingBottom: 4,
  },
}));
