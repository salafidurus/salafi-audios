import { useTopicsList } from "@sd/domain-search";
import { ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText, ScreenHeader, ScreenView } from "@/shared/components";

import { TopicChipGroup } from "../components/topic-chip-group/topic-chip-group";

export type ExploreAllScreenProps = {
  onNavigateToTopicLecture?: (topicSlug: string) => void;
};

export function ExploreAllScreen({ onNavigateToTopicLecture }: ExploreAllScreenProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  const { data: topics, isFetching, isError } = useTopicsList();

  if (topics === undefined && isFetching) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title={t("navigation.subnav.explore.all", "All Lectures")} />
        <ScreenView center>
          <AppText variant="bodyMd" style={{ color: theme.colors.content.muted }}>
            {t("common.loading", "Loading…")}
          </AppText>
        </ScreenView>
      </View>
    );
  }

  if (isError || !topics || topics.length === 0) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title={t("navigation.subnav.explore.all", "All Lectures")} />
        <ScreenView center>
          <AppText variant="bodyMd" style={{ color: theme.colors.content.muted }}>
            {isError
              ? t("common.error", "Something went wrong.")
              : t("topics.noTopics", "No topics available.")}
          </AppText>
        </ScreenView>
      </View>
    );
  }

  const sorted = [...topics].sort((a, b) => (a.orderIndex ?? 99) - (b.orderIndex ?? 99));

  return (
    <View style={styles.screen}>
      <ScreenHeader title={t("navigation.subnav.explore.all", "All Lectures")} />
      <ScrollView contentContainerStyle={styles.content}>
        <TopicChipGroup
          topics={sorted}
          selectedId={null}
          onSelect={(topic) => onNavigateToTopicLecture?.(topic.slug)}
        />

        <View style={styles.placeholder}>
          <AppText variant="bodySm" style={{ color: theme.colors.content.muted }}>
            {t("explore.all.selectPrompt", "Select a category above to browse its lectures.")}
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
  },
  content: {
    gap: theme.spacing.scale.md,
  },
  placeholder: {
    paddingHorizontal: theme.spacing.layout.pageX,
  },
}));
