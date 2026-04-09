import { View, ScrollView } from "react-native";
import { ScreenViewMobileNative } from "../../../../shared/components/ScreenView/ScreenView";
import { AppText } from "../../../../shared/components/AppText/AppText";
import { useScholarDetailScreen } from "@sd/domain-content";
import { ScholarHeaderNative } from "../../components/scholar-header/scholar-header";
import { ScholarContentListNative } from "../../components/scholar-content-list/scholar-content-list";

export type ScholarDetailMobileNativeScreenProps = {
  slug: string;
};

export function ScholarDetailMobileNativeScreen({ slug }: ScholarDetailMobileNativeScreenProps) {
  const { scholar, content, isFetching } = useScholarDetailScreen(slug);

  if (isFetching) {
    return (
      <ScreenViewMobileNative center>
        <AppText variant="bodyMd">Loading scholar...</AppText>
      </ScreenViewMobileNative>
    );
  }

  if (!scholar) {
    return (
      <ScreenViewMobileNative center>
        <AppText variant="titleMd">Scholar not found</AppText>
      </ScreenViewMobileNative>
    );
  }

  return (
    <ScreenViewMobileNative>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16 }}>
        <ScholarHeaderNative scholar={scholar} />
        <View style={{ marginTop: 24 }}>
          {content && <ScholarContentListNative content={content} />}
        </View>
      </ScrollView>
    </ScreenViewMobileNative>
  );
}
