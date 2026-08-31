import { I18nManager, View, type DimensionValue } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { NativeSegmentedControl } from "@/shared/ui/native-segmented-control";

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
  const { theme } = useUnistyles();
  const isNativeRTL = I18nManager.isRTL;
  const isAppRTL = theme.direction === "rtl";

  const shouldReverse = isNativeRTL !== isAppRTL;
  const effectiveOptions = shouldReverse ? [...options].reverse() : options;
  const effectiveIndex = effectiveOptions.findIndex((opt) => opt.value === value);

  return (
    <View accessible accessibilityLabel={ariaLabel} style={base.container}>
      <NativeSegmentedControl
        values={effectiveOptions.map((opt) => opt.label)}
        value={effectiveOptions[effectiveIndex]?.label ?? effectiveOptions[0]?.label ?? ""}
        onValueChange={(label) => {
          const opt = effectiveOptions.find((candidate) => candidate.label === label);
          if (opt) onChange(opt.value);
        }}
        style={base.control}
      />
    </View>
  );
}
