import { useScholarDetail, useScholarContent, useScholarTopics } from "@sd/domain-content";
import { ChevronDown } from "lucide-react-native";
import { useState, useCallback } from "react";
import "react-native-reanimated";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { ScholarContentList } from "@/features/listing/components/scholar-content-list/scholar-content-list";
import { ScholarHeader } from "@/features/listing/components/scholar-header/scholar-header";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { AppText, ScreenView } from "@/shared/ui";

/** Describes the inputs and callbacks accepted by Scholar Detail Screen. */
/** Describes the inputs, callbacks, and optional state accepted by Scholar Detail Screen. */
export type ScholarDetailScreenProps = {
  /** Carries the canonical route identity used to load the selected content. */
  slug: string;
};

type TopicSectionProps = {
  topicName: string;
  children: React.ReactNode;
};

function TopicSection({ topicName, children }: TopicSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const { theme } = useUnistyles();

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View style={styles.topicSection}>
      <Pressable onPress={handleToggle} style={styles.topicHeader}>
        <AppText variant="labelMd">{topicName}</AppText>
        <View style={!expanded && styles.chevronCollapsed}>
          <ChevronDown size={16} color={theme.colors.content.muted} />
        </View>
      </Pressable>
      {expanded && <View style={styles.topicContent}>{children}</View>}
    </View>
  );
}

type TopicItemProps = {
  title: string;
  subtitle?: string;
};

function TopicItem({ title, subtitle }: TopicItemProps) {
  return (
    <View style={styles.topicItem}>
      <AppText variant="bodySm">{title}</AppText>
      {subtitle ? (
        <AppText variant="caption" style={styles.topicItemSubtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

function TopicSections({
  topics,
}: {
  topics:
    | { topicId: string; topicName: string; items: { id: string; title: string; type: string }[] }[]
    | undefined;
}) {
  if (!topics || topics.length === 0) return null;
  return (
    <View style={styles.topicsContainer}>
      {topics.map((topic) => (
        <TopicSection key={topic.topicId} topicName={topic.topicName}>
          {topic.items.map((item) => (
            <TopicItem
              key={item.id}
              title={item.title}
              subtitle={item.type === "single" ? undefined : item.type}
            />
          ))}
        </TopicSection>
      ))}
    </View>
  );
}

/** Renders the native scholar detail screen surface and coordinates its user-facing state. */
export function ScholarDetailScreen({ slug }: ScholarDetailScreenProps) {
  const { data: scholar, isFetching: isScholarFetching } = useScholarDetail(slug);
  const { data: content, isFetching: isContentFetching } = useScholarContent(slug);
  const { data: topicsData } = useScholarTopics(slug);
  const isFetching = isScholarFetching || isContentFetching;

  if (isFetching) {
    return (
      <ScreenView center>
        <EmptyState message="Loading scholar…" variant="loading" />
      </ScreenView>
    );
  }

  if (!scholar) {
    return (
      <ScreenView center>
        <EmptyState message="Scholar not found" variant="error" />
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16 }}>
        <ScholarHeader scholar={scholar} />
        <View style={{ marginTop: 24 }}>
          <ScholarContentList items={content?.items ?? []} />
        </View>
        <TopicSections topics={topicsData?.topics} />
      </ScrollView>
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  topicSection: {
    marginTop: theme.spacing.scale.sm,
    borderRadius: theme.radius.component.card,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    overflow: "hidden",
  },
  topicHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.scale.sm,
    paddingHorizontal: theme.spacing.scale.md,
    backgroundColor: theme.colors.surface.subtle,
  },
  chevronCollapsed: {
    transform: [{ rotate: "-90deg" }],
  },
  topicContent: {
    paddingHorizontal: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.xs,
  },
  topicItem: {
    paddingVertical: theme.spacing.scale.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  topicItemSubtitle: {
    marginTop: theme.spacing.scale.xs,
    opacity: 0.6,
  },
  topicsContainer: {
    marginTop: theme.spacing.scale.lg,
    gap: theme.spacing.scale.sm,
  },
}));
