// oxlint-disable anti-slop/require-tsdoc -- module responsibility is documented below.
import type React from "react";
import type { ColorValue } from "react-native";

/** Provides the iOS system-sheet implementation for the native search palette. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module responsibility is documented above.
import { BottomSheet, Host, RNHostView } from "@expo/ui";

type SearchPaletteSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
  color: ColorValue;
  children: React.ReactElement;
};

/** Keeps iOS on the universal SwiftUI sheet while Android owns its container color. */
export function SearchPaletteSheet({ isPresented, onDismiss, children }: SearchPaletteSheetProps) {
  return (
    <Host>
      <BottomSheet
        isPresented={isPresented}
        onDismiss={onDismiss}
        showDragIndicator={false}
        snapPoints={["half", "full"]}
        contentPadding={0}
        testID="native-search-palette"
      >
        <RNHostView>{children}</RNHostView>
      </BottomSheet>
    </Host>
  );
}
