import type { TopicDetailDto } from "@sd/core-contracts";

import { httpClient, endpoints, queryKeys } from "@sd/core-contracts";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components/AppText/AppText";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

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
      <ScreenView center>
        <AppText variant="bodyMd" style={{ color: theme.colors.content.muted }}>
          {t("common.loading", "Loading…")}
        </AppText>
      </ScreenView>
    );
  }

  if (!topics || topics.length === 0) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd" style={{ color: theme.colors.content.muted }}>
          {t("topics.noTopics", "No topics available.")}
        </AppText>
      </ScreenView>
    );
  }

  if (isError) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd" style={{ color: theme.colors.content.muted }}>
          {t("common.error", "Something went wrong.")}
        </AppText>
      </ScreenView>
    );
  }

  const sorted = [...topics].sort((a, b) => (a.orderIndex ?? 99) - (b.orderIndex ?? 99));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
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
  );
}

function useTopicsList() {
  return useQuery<TopicDetailDto[]>({
    queryKey: queryKeys.topics.all,
    queryFn: async () =>
      httpClient<TopicDetailDto[]>({ url: endpoints.topics.list, method: "GET" }),
  });
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
