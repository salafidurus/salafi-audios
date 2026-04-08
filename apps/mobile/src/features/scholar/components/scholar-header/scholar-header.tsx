import { View, Text, Image, Pressable, Linking } from "react-native";
import type { ScholarDetailDto } from "@sd/core-contracts";

export type ScholarHeaderNativeProps = {
  scholar: ScholarDetailDto & {
    lectureCount: number;
    seriesCount: number;
    totalDurationSeconds: number;
  };
};

export function ScholarHeaderNative({ scholar }: ScholarHeaderNativeProps) {
  const totalHours = Math.round(scholar.totalDurationSeconds / 3600);

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View>
      {scholar.imageUrl && (
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
      )}
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>{scholar.name}</Text>
      {(scholar.country || scholar.mainLanguage) && (
        <Text style={{ color: "#666", fontSize: 13, marginTop: 4, textAlign: "center" }}>
          {[scholar.country, scholar.mainLanguage].filter(Boolean).join(" · ")}
        </Text>
      )}
      {scholar.bio && (
        <Text style={{ marginTop: 12, fontSize: 14, lineHeight: 22 }}>{scholar.bio}</Text>
      )}

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 16 }}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{scholar.lectureCount}</Text>
          <Text style={{ fontSize: 11, color: "#888" }}>Lectures</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{scholar.seriesCount}</Text>
          <Text style={{ fontSize: 11, color: "#888" }}>Series</Text>
        </View>
        {totalHours > 0 && (
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{totalHours}h</Text>
            <Text style={{ fontSize: 11, color: "#888" }}>Total</Text>
          </View>
        )}
      </View>

      {(scholar.socialTwitter ||
        scholar.socialTelegram ||
        scholar.socialYoutube ||
        scholar.socialWebsite) && (
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 16 }}>
          {scholar.socialWebsite && (
            <Pressable onPress={() => openLink(scholar.socialWebsite!)}>
              <Text style={{ color: "#2563eb", fontSize: 13 }}>Website</Text>
            </Pressable>
          )}
          {scholar.socialYoutube && (
            <Pressable onPress={() => openLink(scholar.socialYoutube!)}>
              <Text style={{ color: "#2563eb", fontSize: 13 }}>YouTube</Text>
            </Pressable>
          )}
          {scholar.socialTwitter && (
            <Pressable onPress={() => openLink(scholar.socialTwitter!)}>
              <Text style={{ color: "#2563eb", fontSize: 13 }}>Twitter</Text>
            </Pressable>
          )}
          {scholar.socialTelegram && (
            <Pressable onPress={() => openLink(scholar.socialTelegram!)}>
              <Text style={{ color: "#2563eb", fontSize: 13 }}>Telegram</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
