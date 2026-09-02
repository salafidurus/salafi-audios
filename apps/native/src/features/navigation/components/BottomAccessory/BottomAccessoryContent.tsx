import { useAudio } from "@sd/domain-audio";
import { usePathname } from "expo-router";
import React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MiniPlayer } from "@/features/audio";
import { isTabRoute } from "@/features/navigation/utils/tab-route-config";

/**
 * Renders the bottom accessory for native tab routes when playback is active.
 * The accessory intentionally stays empty when no track is playing; subsection navigation is
 * owned by the native tab routes and must not be rendered from this shared boundary.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the declaration contract is documented above.
export function BottomAccessoryContent() {
  const { currentTrack } = useAudio();
  const pathname = usePathname();

  if (!isTabRoute(pathname) || !currentTrack) {
    return null;
  }

  return (
    <View style={styles.container} testID="miniplayer-only-container">
      <MiniPlayer embedded />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.xs,
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingVertical: theme.spacing.scale.xs,
    width: "100%",
  },
}));
