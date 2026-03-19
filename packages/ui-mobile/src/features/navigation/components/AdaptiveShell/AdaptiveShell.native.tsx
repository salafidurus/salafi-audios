import { useRef } from "react";
import { Platform, View, StyleSheet as RNStyleSheet } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { BlurView } from "expo-blur";
import { EaseView } from "react-native-ease";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import BottomSheet from "@gorhom/bottom-sheet";
import { SectionLauncher } from "../SectionLauncher";
import { SectionModeBar } from "../SectionModeBar";
import { SectionSwitcherSheet } from "../SectionSwitcherSheet";
import { useNavigationStore } from "../../store/navigation-store";
import { getCurrentSection } from "../../utils/get-current-section";
import { SECTION_TABS } from "../../types";
import type { Section } from "../../types";

type Props = {
  blurTargetRef: React.RefObject<InstanceType<typeof View> | null>;
};

export function AdaptiveShell({ blurTargetRef }: Props) {
  const { theme } = useUnistyles();
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const sectionTabs = useNavigationStore((s) => s.sectionTabs);
  const setActiveTab = useNavigationStore((s) => s.setActiveTab);

  const currentSection = getCurrentSection(segments as string[]);
  const isHub = currentSection === "home";

  const horizontalPadding = theme.spacing.layout.pageX;
  const verticalPadding = Platform.OS === "ios" ? theme.spacing.scale.md : theme.spacing.scale.sm;
  const baseHeight = Platform.OS === "ios" ? 68 : 62;
  const floatingBarBottomInset =
    insets.bottom > 0 ? Math.round(insets.bottom * 0.5) : theme.spacing.scale.sm;
  const tabBarHeight = baseHeight + floatingBarBottomInset;

  const androidTint = theme.colors.surface.canvas === "#0D0D0D" ? "dark" : "light";

  const handleTabChange = (tabId: string) => {
    if (currentSection === "home") return;
    setActiveTab(currentSection, tabId);
    router.push(`/(tabs)/(${currentSection})/${tabId}` as never);
  };

  const handleSectionPress = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleSearchPress = () => {
    router.push("/(tabs)/(search)/" as never);
  };

  const handleSwitcherSelect = (target: Section | "home") => {
    if (target === "home") {
      router.push("/(tabs)/(search)/" as never);
    } else {
      const tab = sectionTabs[target];
      router.push(`/(tabs)/(${target})/${tab}` as never);
    }
  };

  return (
    <>
      <View
        style={[
          styles.floatingBar,
          {
            left: horizontalPadding,
            right: horizontalPadding,
            bottom: verticalPadding,
            height: tabBarHeight,
            paddingBottom: floatingBarBottomInset,
            paddingHorizontal: theme.spacing.component.gapMd,
            backgroundColor: theme.colors.surface.elevated,
          },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            tint="systemThinMaterial"
            intensity={65}
            style={[RNStyleSheet.absoluteFill, styles.blurInner]}
          />
        ) : (
          <BlurView
            tint={androidTint as "dark" | "light"}
            intensity={80}
            blurReductionFactor={2}
            blurMethod="dimezisBlurViewSdk31Plus"
            blurTarget={blurTargetRef}
            style={[RNStyleSheet.absoluteFill, styles.blurInner]}
          />
        )}

        <EaseView
          animate={{ opacity: isHub ? 1 : 0 }}
          transition={{ type: "timing", duration: 200 }}
          style={[styles.modeContainer, !isHub && styles.hidden]}
        >
          <SectionLauncher />
        </EaseView>

        <EaseView
          animate={{ opacity: isHub ? 0 : 1 }}
          transition={{ type: "timing", duration: 200 }}
          style={[styles.modeContainer, isHub && styles.hidden]}
        >
          {!isHub && (
            <SectionModeBar
              currentSection={currentSection}
              tabs={SECTION_TABS[currentSection]}
              activeTab={sectionTabs[currentSection]}
              onTabChange={handleTabChange}
              onSectionPress={handleSectionPress}
              onSearchPress={handleSearchPress}
            />
          )}
        </EaseView>
      </View>

      {!isHub && (
        <SectionSwitcherSheet
          currentSection={currentSection}
          bottomSheetRef={bottomSheetRef}
          onSelect={handleSwitcherSelect}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  floatingBar: {
    position: "absolute",
    borderRadius: theme.radius.component.panel,
    paddingTop: theme.spacing.scale.sm,
    ...theme.shadows.lg,
    overflow: "hidden",
  },
  blurInner: {
    borderRadius: theme.radius.component.panel,
    overflow: "hidden",
  },
  modeContainer: {
    ...RNStyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.component.gapMd,
  },
  hidden: {
    pointerEvents: "none",
  },
}));
