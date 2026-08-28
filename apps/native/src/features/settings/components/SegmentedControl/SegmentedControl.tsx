import { SegmentedControl as NativeSegmentedControl } from "@expo/ui/community/segmented-control";
import { I18nManager, View, type DimensionValue } from "react-native";
import { useUnistyles } from "react-native-unistyles";

/** Provides native account, preference, support, and settings workflows. */
const FULL_WIDTH: DimensionValue = "100%";

const base = {
  container: { width: FULL_WIDTH },
  control: { width: FULL_WIDTH },
};

/** Renders the native segmented control option surface and coordinates its user-facing state. */
export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

/** Describes the inputs and callbacks accepted by Segmented Control. */
export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

/** Renders the native segmented control surface and coordinates its user-facing state. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  const { theme, rt } = useUnistyles();
  const isNativeRTL = I18nManager.isRTL;
  const isAppRTL = theme.direction === "rtl";

  const shouldReverse = isNativeRTL !== isAppRTL;
  const effectiveOptions = shouldReverse ? [...options].reverse() : options;
  const effectiveIndex = effectiveOptions.findIndex((opt) => opt.value === value);

  return (
    // NativeSegmentedControl wraps itself in its own @expo/ui Host internally —
    // nesting another Host around it breaks touch dispatch, so this is a plain
    // RN View purely for the accessibility label, not a second native boundary.
    // NativeSegmentedControl's internal Host only matches content *height*
    // (`matchContents: { vertical: true }`), so width comes entirely from
    // external layout — without an explicit width here it collapses to ~0.
    <View accessible accessibilityLabel={ariaLabel} style={base.container}>
      <NativeSegmentedControl
        values={effectiveOptions.map((opt) => opt.label)}
        selectedIndex={effectiveIndex === -1 ? undefined : effectiveIndex}
        onChange={(event) => {
          const opt = effectiveOptions[event.nativeEvent.selectedSegmentIndex];
          if (opt) onChange(opt.value);
        }}
        tintColor={theme.colors.action.primary}
        appearance={
          rt.themeName === "dark" || (rt.themeName === "system" && rt.colorScheme === "dark")
            ? "dark"
            : "light"
        }
        style={base.control}
      />
    </View>
  );
}
