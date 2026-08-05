import { SegmentedControl as NativeSegmentedControl } from "@expo/ui/community/segmented-control";
import { I18nManager, View, type ViewStyle } from "react-native";
import { useUnistyles } from "react-native-unistyles";

const base = {
  container: { width: "100%" } as ViewStyle,
  control: { width: "100%" } as ViewStyle,
};

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

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
          rt.themeName === "midnight" ||
          rt.themeName === "ember" ||
          (rt.themeName === "system" && rt.colorScheme === "dark")
            ? "dark"
            : "light"
        }
        style={base.control}
      />
    </View>
  );
}
