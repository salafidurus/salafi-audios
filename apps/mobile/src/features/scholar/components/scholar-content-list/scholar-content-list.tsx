import { View, Text } from "react-native";
import type { ScholarContentDto } from "@sd/core-contracts";

export type ScholarContentListNativeProps = {
  content: ScholarContentDto;
};

export function ScholarContentListNative({ content }: ScholarContentListNativeProps) {
  return (
    <View>
      {content.collections.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Collections</Text>
          {content.collections.map((c) => (
            <View
              key={c.id}
              style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" }}
            >
              <Text style={{ fontWeight: "500", fontSize: 15 }}>{c.title}</Text>
              <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                {c.lectureCount} series
              </Text>
            </View>
          ))}
        </View>
      )}

      {content.standaloneSeries.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Series</Text>
          {content.standaloneSeries.map((s) => (
            <View
              key={s.id}
              style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" }}
            >
              <Text style={{ fontWeight: "500", fontSize: 15 }}>{s.title}</Text>
              <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                {s.lectureCount} lectures
              </Text>
            </View>
          ))}
        </View>
      )}

      {content.standaloneLectures.length > 0 && (
        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Lectures</Text>
          {content.standaloneLectures.map((l) => (
            <View
              key={l.id}
              style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" }}
            >
              <Text style={{ fontWeight: "500", fontSize: 15 }}>{l.title}</Text>
              <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                {l.durationSeconds ? `${Math.round(l.durationSeconds / 60)} min` : ""}
              </Text>
            </View>
          ))}
        </View>
      )}

      {content.collections.length === 0 &&
        content.standaloneSeries.length === 0 &&
        content.standaloneLectures.length === 0 && (
          <Text style={{ color: "#888", fontSize: 14 }}>No published content yet.</Text>
        )}
    </View>
  );
}
