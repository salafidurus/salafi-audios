import type { ScholarContentItemDto } from "@sd/core-contracts";

import { pickContentField } from "@sd/core-i18n";
import { useScholarContent, useScholarDetail } from "@sd/domain-content";
import { ChevronRight } from "lucide-react-native";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { ScholarHeader } from "@/features/listing/components/scholar-header/scholar-header";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { AppText } from "@/shared/components/AppText/AppText";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

export type ScholarDetailScreenProps = {
  slug: string;
};

// ─── Prototype ListRow for scholar content ──────────────────────────────────
type ContentRowProps = {
  item: ScholarContentItemDto;
  onPress: () => void;
  showOriginal?: boolean;
};

function ContentRow({ item, onPress, showOriginal = false }: ContentRowProps) {
  const { theme } = useUnistyles();
  const title = pickContentField(item.title, item.original?.title, showOriginal);
  const initials = title.trim().charAt(0).toUpperCase();

  const countLabel =
    item.type !== "single" && (item.lectureCount ?? 0) > 0
      ? `${item.lectureCount} ${item.lectureCount === 1 ? "lecture" : "lectures"}`
      : item.type;

  return (
    <Pressable
      onPress={onPress}
      style={styles.row}
      testID={`content-row-${item.slug}`}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {/* Cover box */}
      <View style={styles.coverBox}>
        <AppText variant="displayMd" style={styles.coverInitial}>
          {initials}
        </AppText>
      </View>

      {/* Text */}
      <View style={styles.rowText}>
        <AppText variant="titleMd" style={styles.rowTitle} numberOfLines={2}>
          {title}
        </AppText>
        {countLabel ? (
          <AppText variant="caption" color="muted" style={styles.rowSub} numberOfLines={1}>
            {countLabel}
          </AppText>
        ) : null}
      </View>

      <ChevronRight size={16} color={theme.colors.content.muted} />
    </Pressable>
  );
}

// ─── Main screen ────────────────────────────────────────────────────────────
export function ScholarDetailScreen({ slug }: ScholarDetailScreenProps) {
  const { t } = useTranslation();
  const { data: scholar, isFetching: isScholarFetching } = useScholarDetail(slug);
  const { data: content, isFetching: isContentFetching } = useScholarContent(slug);
  const isFetching = isScholarFetching || isContentFetching;
  const { navigateToListing } = useListingNavigation();
  const showOriginal = useShowOriginalContent();

  if (isFetching) {
    return (
      <ScreenView center>
        <EmptyState message={t("scholar.loading", "Loading scholar…")} variant="loading" />
      </ScreenView>
    );
  }

  if (!scholar) {
    return (
      <ScreenView center>
        <EmptyState message={t("scholar.notFound", "Scholar not found")} variant="error" />
      </ScreenView>
    );
  }

  const items = content?.items ?? [];

  return (
    <ScreenView includeTopInset={Platform.OS !== "ios"}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustsScrollIndicatorInsets={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Scholar hero — cover box, name, language, bio, stats */}
        <ScholarHeader scholar={scholar} />

        {/* Series / content list */}
        {items.length > 0 ? (
          <View style={styles.listSection}>
            <AppText variant="xs" style={styles.sectionLabel}>
              {t("scholar.seriesLabel", "SERIES")}
            </AppText>
            {items.map((item) => (
              <ContentRow
                key={item.id}
                item={item}
                showOriginal={showOriginal}
                onPress={() => navigateToListing(item.slug)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            message={t("scholarContent.empty", "No published content yet.")}
            variant="empty"
          />
        )}
      </ScrollView>
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    paddingBottom: theme.spacing.scale["2xl"],
  },
  listSection: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: theme.colors.content.muted,
    textTransform: "uppercase",
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingBottom: 8,
    paddingTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.layout.pageX,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  coverBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: theme.colors.surface.primarySubtle,
    borderWidth: 1,
    borderColor: `${theme.colors.action.primary}55`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  coverInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.action.primary,
  },
  rowText: {
    flex: 1,
    marginRight: 8,
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: "600",
    lineHeight: 20,
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
  },
}));
