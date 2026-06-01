import type { ScholarDetailDto } from "@sd/core-contracts";
import { Linking, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { AppText } from "@/shared/components/AppText/AppText";

export type ScholarHeaderProps = {
  scholar: ScholarDetailDto & {
    lectureCount: number;
    seriesCount: number;
    totalDurationSeconds: number;
  };
};

export function ScholarHeader({ scholar }: ScholarHeaderProps) {
  const totalHours = Math.round(scholar.totalDurationSeconds / 3600);

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <View>
      {scholar.imageUrl ? (
        <Image
          source={{ uri: scholar.imageUrl }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginBottom: 12,
            alignSelf: "center",
          }}
        />
      ) : null}
      <AppText variant="titleLg" style={{ textAlign: "center" }}>
        {scholar.name}
      </AppText>
      {scholar.country || scholar.mainLanguage ? (
        <AppText variant="caption" style={{ marginTop: 4, textAlign: "center", opacity: 0.7 }}>
          {[scholar.country, scholar.mainLanguage].filter(Boolean).join(" · ")}
        </AppText>
      ) : null}
      {scholar.bio ? (
        <AppText variant="bodyMd" style={{ marginTop: 12, lineHeight: 22 }}>
          {scholar.bio}
        </AppText>
      ) : null}

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 16 }}>
        <View style={{ alignItems: "center" }}>
          <AppText variant="titleMd">{scholar.lectureCount}</AppText>
          <AppText variant="caption" style={{ opacity: 0.6 }}>
            Lectures
          </AppText>
        </View>
        <View style={{ alignItems: "center" }}>
          <AppText variant="titleMd">{scholar.seriesCount}</AppText>
          <AppText variant="caption" style={{ opacity: 0.6 }}>
            Series
          </AppText>
        </View>
        {totalHours > 0 ? (
          <View style={{ alignItems: "center" }}>
            <AppText variant="titleMd">{totalHours}h</AppText>
            <AppText variant="caption" style={{ opacity: 0.6 }}>
              Total
            </AppText>
          </View>
        ) : null}
      </View>

      {scholar.socialWebsite ||
      scholar.socialYoutube ||
      scholar.socialTwitter ||
      scholar.socialTelegram ? (
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 16 }}>
          {scholar.socialWebsite ? (
            <Pressable onPress={() => openLink(scholar.socialWebsite!)}>
              <AppText variant="labelMd">Website</AppText>
            </Pressable>
          ) : null}
          {scholar.socialYoutube ? (
            <Pressable onPress={() => openLink(scholar.socialYoutube!)}>
              <AppText variant="labelMd">YouTube</AppText>
            </Pressable>
          ) : null}
          {scholar.socialTwitter ? (
            <Pressable onPress={() => openLink(scholar.socialTwitter!)}>
              <AppText variant="labelMd">Twitter</AppText>
            </Pressable>
          ) : null}
          {scholar.socialTelegram ? (
            <Pressable onPress={() => openLink(scholar.socialTelegram!)}>
              <AppText variant="labelMd">Telegram</AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
