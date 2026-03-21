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

export default function ShellLayoutWeb() {
  const containerRef = useRef<View>(null);
  const router = useRouter();
  const { activeSection, searchHref, resolveSectionHref, ...shellState } = useActiveNavigationState();

  const handleSelectSection = useCallback(
    (target: Section | "home") => {
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
      <View style={styles.content}>
        <Slot />
      </View>
      <AdaptiveShell
        blurTargetRef={containerRef}
        shellState={{ activeSection, ...shellState }}
        onSelectSection={handleSelectSection}
        onTabChange={handleTabChange}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 96,
  },
}));
