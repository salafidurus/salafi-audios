import { useState, useCallback, useEffect } from "react";
import { LayoutAnimation, Platform, Pressable, ScrollView, UIManager, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useScholarDetail, useScholarContent, useScholarTopics } from "@sd/domain-content";
import type { ScholarTopicsDto } from "@sd/core-contracts";
import { ChevronDown } from "lucide-react-native";
import { AppText } from "@/shared/components/AppText/AppText";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScholarContentList } from "@/features/scholar/components/scholar-content-list/scholar-content-list";
import { ScholarHeader } from "@/features/scholar/components/scholar-header/scholar-header";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type ScholarDetailScreenProps = {
  slug: string;
};

type TopicSectionProps = {
  topicName: string;
  children: React.ReactNode;
};

function TopicSection({ topicName, children }: TopicSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View style={styles.topicSection}>
      <Pressable onPress={handleToggle} style={styles.topicHeader}>
        <AppText variant="labelMd">{topicName}</AppText>
        <ChevronDown size={16} style={[styles.chevron, !expanded && styles.chevronCollapsed]} />
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

export function ScholarDetailScreen({ slug }: ScholarDetailScreenProps) {
  const { data: scholar, isFetching: isScholarFetching } = useScholarDetail(slug);
  const { data: content, isFetching: isContentFetching } = useScholarContent(slug);
  const { data: topicsData } = useScholarTopics(slug);
  const isFetching = isScholarFetching || isContentFetching;

  if (isFetching) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">Loading scholar…</AppText>
      </ScreenView>
    );
  }

  if (!scholar) {
    return (
      <ScreenView center>
        <AppText variant="titleMd">Scholar not found</AppText>
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
        {topicsData?.topics && topicsData.topics.length > 0 ? (
          <View style={styles.topicsContainer}>
            {topicsData.topics.map((topic) => (
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
        ) : null}
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
  chevron: {
    color: theme.colors.content.muted,
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
