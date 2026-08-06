import { useAudio } from "@sd/domain-audio";
import { usePathname } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MiniPlayer, MiniPlayerIconButton } from "@/features/audio";
import { SECTION_TABS, type Section } from "@/features/navigation/types";
import { getRootTabFromPathname } from "@/features/navigation/utils/tab-route-config";

import { SubrouteIconButton } from "./SubrouteIconButton";
import { SubrouteTabsBar } from "./SubrouteTabsBar";

/** Tabs whose sub-route pill bar is handled by their own in-screen UI. */
const TABS_WITH_OWN_SUBROUTE_UI: string[] = ["home", "explore", "library", "search"];

export function BottomAccessoryContent() {
  const { currentTrack } = useAudio();
  const pathname = usePathname();
  const [expandedView, setExpandedView] = useState<"miniPlayer" | "subroute">("miniPlayer");

  const hasMiniPlayer = Boolean(currentTrack);

  const activeRootTab = getRootTabFromPathname(pathname);
  const hasSubroute =
    !TABS_WITH_OWN_SUBROUTE_UI.includes(activeRootTab ?? "") &&
    Boolean(SECTION_TABS[activeRootTab as Section]?.length);

  if (hasSubroute && !hasMiniPlayer) {
    return (
      <View style={styles.container} testID="subroute-only-container">
        <SubrouteTabsBar />
      </View>
    );
  }

  if (hasMiniPlayer && !hasSubroute) {
    return (
      <View style={styles.container} testID="miniplayer-only-container">
        <MiniPlayer embedded />
      </View>
    );
  }

  if (!hasMiniPlayer && !hasSubroute) {
    return null;
  }

  // Dual mode (both available)
  return (
    <View style={styles.container} testID="dual-mode-container">
      {expandedView === "miniPlayer" ? (
        <>
          <SubrouteIconButton onPress={() => setExpandedView("subroute")} />
          <View style={styles.expandedContent}>
            <MiniPlayer embedded />
          </View>
        </>
      ) : (
        <>
          <View style={styles.expandedContent}>
            <SubrouteTabsBar />
          </View>
          <MiniPlayerIconButton onPress={() => setExpandedView("miniPlayer")} />
        </>
      )}
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
  expandedContent: {
    flex: 1,
  },
}));
