import {
  AdaptiveShell,
  buildSectionHref,
  useActiveNavigationState,
  type Section,
} from "@sd/feature-navigation";
import { type Href, Slot, useRouter } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useCallback, useRef } from "react";

export default function TabLayout() {
  const containerRef = useRef<View>(null);
  const router = useRouter();
  const { activeSection, searchHref, resolveSectionHref, ...shellState } = useActiveNavigationState();

  const handleSelectSection = useCallback(
    (target: Section | "home") => {
      // Dynamic shell routes are centralized in feature-navigation utils and cast here
      // because Expo typed routes cannot statically verify these generated hrefs yet.
      // Top-level shell switches use replace semantics so section re-entry restores
      // remembered subsection state without polluting back history with peer-root hops.
      if (target === "home") {
        router.replace(searchHref as Href);
        return;
      }

      router.replace(resolveSectionHref(target) as Href);
    },
    [resolveSectionHref, router, searchHref],
  );

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (!activeSection) {
        return;
      }

      router.push(buildSectionHref(activeSection, tabId) as Href);
    },
    [activeSection, router],
  );

  return (
    <View ref={containerRef} style={styles.container}>
      <Slot />
      <AdaptiveShell
        blurTargetRef={containerRef}
        shellState={{ activeSection, ...shellState }}
        onSelectSection={handleSelectSection}
        onTabChange={handleTabChange}
      />
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
  },
}));
