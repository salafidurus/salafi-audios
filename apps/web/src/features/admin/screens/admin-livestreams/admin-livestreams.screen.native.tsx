import { View, ScrollView, Text, Pressable } from "react-native";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { LiveSessionDeltaDto } from "@sd/core-contracts";

export function AdminLivestreamsMobileNativeScreen() {
  const { data: activeData, isFetching: loadingActive } = useApiQuery<LiveSessionDeltaDto>(
    queryKeys.live.active(),
    () => httpClient<LiveSessionDeltaDto>({ url: endpoints.live.active, method: "GET" }),
  );
  const { data: scheduledData, isFetching: loadingScheduled } = useApiQuery<LiveSessionDeltaDto>(
    queryKeys.live.scheduled(),
    () => httpClient<LiveSessionDeltaDto>({ url: endpoints.live.upcoming, method: "GET" }),
  );

  if (loadingActive || loadingScheduled) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const active = activeData?.sessions ?? [];
  const scheduled = scheduledData?.sessions ?? [];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Manage Livestreams</Text>

      {active.length > 0 && (
        <>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#16a34a", marginBottom: 8 }}>
            Active ({active.length})
          </Text>
          {active.map((s) => (
            <Pressable
              key={s.id}
              style={{
                padding: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#e0e0e0",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>{s.title ?? "Untitled"}</Text>
              <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                {s.channelDisplayName}
              </Text>
            </Pressable>
          ))}
        </>
      )}

      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: "#2563eb",
          marginBottom: 8,
          marginTop: 16,
        }}
      >
        Scheduled ({scheduled.length})
      </Text>
      {scheduled.map((s) => (
        <Pressable
          key={s.id}
          style={{
            padding: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e0e0e0",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600" }}>{s.title ?? "Untitled"}</Text>
          <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{s.channelDisplayName}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
