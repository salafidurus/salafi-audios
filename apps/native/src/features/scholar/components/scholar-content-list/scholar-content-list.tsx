import type { ScholarContentDto } from "@sd/core-contracts";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { pickContentField } from "@sd/core-i18n";
import { AppText } from "@/shared/components/AppText/AppText";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";

export type ScholarContentListProps = {
  content: ScholarContentDto;
};

function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <AppText variant="titleMd" style={{ marginBottom: 8 }}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

export function ScholarContentList({ content }: ScholarContentListProps) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const hasContent =
    content.collections.length > 0 || content.series.length > 0 || content.singles.length > 0;

  if (!hasContent) {
    return (
      <AppText variant="bodyMd" style={{ opacity: 0.7 }}>
        {t("scholarContent.empty", "No published content yet.")}
      </AppText>
    );
  }

  return (
    <View>
      {content.collections.length > 0 ? (
        <ContentSection title={t("scholarContent.collections", "Collections")}>
          {content.collections.map((collection) => {
            const title = pickContentField(
              collection.title,
              collection.original?.title,
              showOriginal,
            );
            return (
              <View key={collection.id} style={styles.row}>
                <AppText variant="labelMd">{title}</AppText>
                <AppText variant="caption" style={{ marginTop: 2, opacity: 0.6 }}>
                  {t("scholarContent.seriesCount", "{{count}} series", {
                    count: collection.lectureCount,
                  })}
                </AppText>
              </View>
            );
          })}
        </ContentSection>
      ) : null}

      {content.series.length > 0 ? (
        <ContentSection title={t("scholarContent.series", "Series")}>
          {content.series.map((series) => {
            const title = pickContentField(series.title, series.original?.title, showOriginal);
            return (
              <View key={series.id} style={styles.row}>
                <AppText variant="labelMd">{title}</AppText>
                <AppText variant="caption" style={{ marginTop: 2, opacity: 0.6 }}>
                  {t("scholarContent.lectureCount", "{{count}} lectures", {
                    count: series.lectureCount,
                  })}
                </AppText>
              </View>
            );
          })}
        </ContentSection>
      ) : null}

      {content.singles.length > 0 ? (
        <ContentSection title={t("scholarContent.singles", "Singles")}>
          {content.singles.map((lecture) => {
            const title = pickContentField(lecture.title, lecture.original?.title, showOriginal);
            return (
              <View key={lecture.id} style={styles.row}>
                <AppText variant="labelMd">{title}</AppText>
                <AppText variant="caption" style={{ marginTop: 2, opacity: 0.6 }}>
                  {lecture.durationSeconds ? `${Math.round(lecture.durationSeconds / 60)} min` : ""}
                </AppText>
              </View>
            );
          })}
        </ContentSection>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
}));
