/** Provides a controlled, direction-aware native segmented control. */
import { Host } from "@expo/ui";
import { SegmentedControl as NativeSegmentedControl } from "@expo/ui/community/segmented-control";
import { I18nManager } from "react-native";
import { useUnistyles } from "react-native-unistyles";

/** Describes one selectable native segmented-control option. */
/** Defines one selectable option in the segmented control. */
export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

/** Describes the controlled value and callback contract for the segmented control. */
export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  testID?: string;
}

/** Renders a direction-aware native segmented control. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  testID,
}: SegmentedControlProps<T>) {
  const { theme, rt } = useUnistyles();
  const isNativeRTL = I18nManager.isRTL;
  const isAppRTL = theme.direction === "rtl";

  const shouldReverse = isNativeRTL !== isAppRTL;
  const effectiveOptions = shouldReverse ? [...options].reverse() : options;
  const effectiveIndex = effectiveOptions.findIndex((opt) => opt.value === value);

  return (
    <Host matchContents={false} style={{ flex: 1 }}>
      <NativeSegmentedControl
        testID={testID}
        values={effectiveOptions.map((opt) => opt.label)}
        selectedIndex={effectiveIndex === -1 ? undefined : effectiveIndex}
        onChange={(event) => {
          const opt = effectiveOptions[event.nativeEvent.selectedSegmentIndex];
          if (opt) onChange(opt.value);
        }}
        tintColor={theme.colors.action.primary}
        appearance={rt.themeName === "dark" ? "dark" : "light"}
        style={{ alignSelf: "stretch" }}
      />
    </Host>
  );
}
