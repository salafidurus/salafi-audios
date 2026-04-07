import { View, Text, TouchableOpacity, FlatList } from "react-native";
import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveEndedScreen } from "../hooks/use-live-ended";

export type LiveEndedMobileNativeScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

function EndedItem({ session, onPress }: { session: LiveSessionDto; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" }}
    >
      <Text style={{ fontSize: 15, fontWeight: "600" }}>{session.title}</Text>
      <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{session.scholarName}</Text>
      {session.endedAt && (
        <Text style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
          {new Date(session.endedAt).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function LiveEndedMobileNativeScreen({
  onNavigateToSession,
}: LiveEndedMobileNativeScreenProps) {
  const { sessions, isFetching } = useLiveEndedScreen();

  if (isFetching && sessions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading past sessions...</Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: "#666", textAlign: "center" }}>No past sessions available.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sessions}
      keyExtractor={(session) => session.id}
      renderItem={({ item: session }) => (
        <EndedItem session={session} onPress={() => onNavigateToSession?.(session.id)} />
      )}
      contentContainerStyle={{ padding: 8 }}
    />
  );
}
