import { View, ScrollView } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { ScreenViewMobileNative, AppText } from "@sd/shared";
import type { LiveSessionPublicDto } from "@sd/core-contracts";
import { useLiveSessions } from "../hooks/use-live-sessions";
import { LiveSessionCardNative } from "../components/live-session-card/live-session-card.native";

export type LiveMobileNativeScreenProps = Record<string, never>;

function Section({
  title,
  sessions,
  isLoading,
  emptyMessage,
}: {
  title: string;
  sessions: LiveSessionPublicDto[];
  isLoading: boolean;
  emptyMessage: string;
}) {
  const { theme } = useUnistyles();

  return (
    <View style={nativeStyles.section}>
      <AppText variant="titleMd">{title}</AppText>
      {isLoading && sessions.length === 0 ? (
        <AppText variant="bodyMd" style={{ color: theme.colors.content.subtle }}>
          Loading…
        </AppText>
      ) : sessions.length === 0 ? (
        <AppText variant="bodyMd" style={{ color: theme.colors.content.subtle }}>
          {emptyMessage}
        </AppText>
      ) : (
        <View>
          {sessions.map((s) => (
            <LiveSessionCardNative key={s.id} session={s} />
          ))}
        </View>
      )}
    </View>
  );
}

export function LiveMobileNativeScreen(_props: LiveMobileNativeScreenProps) {
  const { active, upcoming, ended } = useLiveSessions();

  return (
    <ScreenViewMobileNative>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={nativeStyles.scroll}>
        <AppText variant="titleLg">Live Sessions</AppText>

        <Section
          title="🔴 Live Now"
          sessions={active.sessions}
          isLoading={active.isLoading}
          emptyMessage="No live sessions right now."
        />
        <Section
          title="Upcoming"
          sessions={upcoming.sessions}
          isLoading={upcoming.isLoading}
          emptyMessage="No upcoming sessions scheduled."
        />
        <Section
          title="Recently Ended"
          sessions={ended.sessions}
          isLoading={ended.isLoading}
          emptyMessage="No recent sessions."
        />
      </ScrollView>
    </ScreenViewMobileNative>
  );
}

const nativeStyles = StyleSheet.create((theme) => ({
  scroll: {
    paddingBottom: theme.spacing.layout.sectionY,
    gap: theme.spacing.layout.sectionY,
  },
  section: {
    gap: theme.spacing.component.gapMd,
  },
}));
