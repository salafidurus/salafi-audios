import { ScrollView, View } from "react-native";
import { useScholarDetailScreen } from "@sd/domain-content";
import { AppText } from "@/shared/components/AppText/AppText";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScholarContentList } from "@/features/scholar/components/scholar-content-list/scholar-content-list";
import { ScholarHeader } from "@/features/scholar/components/scholar-header/scholar-header";

export type ScholarDetailScreenProps = {
  slug: string;
};

export function ScholarDetailScreen({ slug }: ScholarDetailScreenProps) {
  const { scholar, content, isFetching } = useScholarDetailScreen(slug);

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
          {content ? <ScholarContentList content={content} /> : null}
        </View>
      </ScrollView>
    </ScreenView>
  );
}
