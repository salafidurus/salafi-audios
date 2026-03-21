import { useRef } from "react";
import { Platform, View, StyleSheet as RNStyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { EaseView } from "react-native-ease";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import BottomSheet from "@gorhom/bottom-sheet";
import { SectionLauncher } from "../SectionLauncher";
import { SectionModeBar } from "../SectionModeBar";
import { SectionSwitcherSheet } from "../SectionSwitcherSheet";
import { SECTION_TABS } from "../../types";
import type { ActiveNavigationState, Section } from "../../types";

type Props = {
  blurTargetRef: React.RefObject<InstanceType<typeof View> | null>;
  shellState: ActiveNavigationState;
  onSelectSection: (target: Section | "home") => void;
  onTabChange: (tabId: string) => void;
};

export function AdaptiveShell({ blurTargetRef, shellState, onSelectSection, onTabChange }: Props) {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const horizontalPadding = theme.spacing.layout.pageX;
  const verticalPadding = Platform.OS === "ios" ? theme.spacing.scale.md : theme.spacing.scale.sm;
  const baseHeight = Platform.OS === "ios" ? 68 : 62;
  const floatingBarBottomInset =
    insets.bottom > 0 ? Math.round(insets.bottom * 0.5) : theme.spacing.scale.sm;
  const tabBarHeight = baseHeight + floatingBarBottomInset;

  const androidTint = theme.colors.surface.canvas === "#0D0D0D" ? "dark" : "light";

  const handleSectionPress = () => {
    if (!shellState.canOpenSectionSwitcher) {
      return;
    }

    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleSwitcherSelect = (target: Section | "home") => {
    onSelectSection(target);
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
          animate={{ opacity: shellState.showSectionLauncher ? 1 : 0 }}
          transition={{ type: "timing", duration: 200 }}
          style={[styles.modeContainer, !shellState.showSectionLauncher && styles.hidden]}
        >
          <SectionLauncher onSelectSection={onSelectSection} />
        </EaseView>

        <EaseView
          animate={{ opacity: shellState.shellMode === "section" ? 1 : 0 }}
          transition={{ type: "timing", duration: 200 }}
          style={[styles.modeContainer, shellState.shellMode !== "section" && styles.hidden]}
        >
          {shellState.activeSection && shellState.activeTab && (
            <SectionModeBar
              currentSection={shellState.activeSection}
              tabs={SECTION_TABS[shellState.activeSection]}
              activeTab={shellState.activeTab}
              onTabChange={onTabChange}
              onSectionPress={handleSectionPress}
              onSearchPress={() => onSelectSection("home")}
            />
          )}
        </EaseView>
      </View>

      {shellState.showSectionSwitcher && shellState.activeSection && (
        <SectionSwitcherSheet
          currentSection={shellState.activeSection}
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
