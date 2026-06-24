import { useCallback } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveEndedScreen } from "@sd/domain-live";
import { useTranslation } from "@/core/i18n/use-translation";
import { LiveSkeleton } from "../components/live-skeleton/live-skeleton";

export type LiveEndedScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

function EndedItem({ session, onPress }: { session: LiveSessionDto; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Text style={styles.title}>{session.title}</Text>
      <Text style={styles.scholar}>{session.scholarName}</Text>
      {session.endedAt && (
        <Text style={styles.endedTime}>{new Date(session.endedAt).toLocaleDateString()}</Text>
      )}
    </Pressable>
  );
}

export function LiveEndedScreen({ onNavigateToSession }: LiveEndedScreenProps) {
  const { sessions, isFetching } = useLiveEndedScreen();
  const { t } = useTranslation();

  const handleSessionPress = useCallback(
    (id: string) => {
      onNavigateToSession?.(id);
    },
    [onNavigateToSession],
  );

  const renderItem = useCallback(
    ({ item: session }: { item: LiveSessionDto }) => (
      <EndedItem session={session} onPress={() => handleSessionPress(session.id)} />
    ),
    [handleSessionPress],
  );

  if (isFetching && sessions.length === 0) {
    return (
      <View style={styles.skeletonWrap}>
        <LiveSkeleton />
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {t("live.sections.ended.empty", "No recent sessions.")}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sessions}
      keyExtractor={(session) => session.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  scholar: {
    fontSize: 12,
    color: theme.colors.content.muted,
    marginTop: 2,
  },
  endedTime: {
    fontSize: 12,
    color: theme.colors.content.muted,
    marginTop: 2,
  },
  skeletonWrap: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    color: theme.colors.content.muted,
    textAlign: "center",
  },
  listContent: {
    padding: 8,
  },
}));
