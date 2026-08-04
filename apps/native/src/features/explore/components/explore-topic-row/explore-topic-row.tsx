import type { ContentSuggestionDto } from "@sd/core-contracts";

import { Column, Row, ScrollView } from "@expo/ui";
import { pickContentField } from "@sd/core-i18n";
import { useFormattedScholarName } from "@sd/domain-content";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { NativeButton, NativeText } from "@/shared/ui";

export type ExploreTopicRowProps = {
  topicName: string;
  items: ContentSuggestionDto[];
  onItemPress?: (slug: string) => void;
};

type TopicCardProps = {
  item: ContentSuggestionDto;
  showOriginal: boolean;
  onItemPress?: (slug: string) => void;
};

function TopicCard({ item, showOriginal, onItemPress }: TopicCardProps) {
  const { theme } = useUnistyles();
  const title = pickContentField(item.title, item.original?.title, showOriginal);
  const scholarName = useFormattedScholarName(item.scholarName, item.scholarSlug);

  return (
    <Column spacing={theme.spacing.scale.xs}>
      <NativeButton
        label={title}
        variant="outline"
        size="md"
        onPress={() => onItemPress?.(item.slug)}
      />
      <NativeText variant="caption" colorRole="muted">
        {scholarName}
      </NativeText>
      {item.durationSeconds ? (
        <NativeText variant="caption" colorRole="muted">
          {`${String(Math.floor(item.durationSeconds / 60))}m`}
        </NativeText>
      ) : null}
    </Column>
  );
}

export function ExploreTopicRow({ topicName, items, onItemPress }: ExploreTopicRowProps) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  if (!items.length) return null;

  return (
    <Column spacing={theme.spacing.scale.sm}>
      <NativeText variant="titleMd" colorRole="strong">
        {t("feed.newInTopic", "New in {{topic}}", { topic: topicName })}
      </NativeText>
      <ScrollView showsIndicators={false}>
        <Row spacing={theme.spacing.scale.md}>
          {items.map((item) => (
            <TopicCard
              key={item.id}
              item={item}
              showOriginal={showOriginal}
              onItemPress={onItemPress}
            />
          ))}
        </Row>
      </ScrollView>
    </Column>
  );
}
