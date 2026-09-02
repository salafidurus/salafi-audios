// oxlint-disable anti-slop/require-tsdoc -- module responsibility is documented below.
import type { ColorValue } from "react-native";

/** Provides the Android container-color seam for the native search palette. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module responsibility is documented above.
import {
  Column,
  Host,
  ModalBottomSheet,
  RNHostView,
  type ModalBottomSheetRef,
} from "@expo/ui/jetpack-compose";
import { fillMaxHeight, padding } from "@expo/ui/jetpack-compose/modifiers";
import React, { useEffect, useRef, useState } from "react";

type SearchPaletteSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
  color: ColorValue;
  children: React.ReactElement;
};

/** Renders the palette with one Android Material surface through the bottom inset. */
export function SearchPaletteSheet({
  isPresented,
  onDismiss,
  color,
  children,
}: SearchPaletteSheetProps) {
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const [mounted, setMounted] = useState(isPresented);

  useEffect(() => {
    if (isPresented) {
      setMounted(true);
      return;
    }
    let cancelled = false;
    sheetRef.current?.hide().then(() => {
      if (!cancelled) setMounted(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isPresented]);

  if (!mounted) return null;

  return (
    <Host style={{ position: "absolute" }} pointerEvents="none">
      <ModalBottomSheet
        ref={sheetRef}
        onDismissRequest={onDismiss}
        containerColor={color}
        showDragHandle={false}
        properties={{ shouldDismissOnBackPress: true, shouldDismissOnClickOutside: true }}
      >
        <Column modifiers={[padding(0, 0, 0, 0), fillMaxHeight()]}>
          <RNHostView>{children}</RNHostView>
        </Column>
      </ModalBottomSheet>
    </Host>
  );
}
