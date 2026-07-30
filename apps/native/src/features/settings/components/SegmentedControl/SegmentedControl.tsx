import { Host } from "@expo/ui";
import { SegmentedControl as NativeSegmentedControl } from "@expo/ui/community/segmented-control";
import { useUnistyles } from "react-native-unistyles";

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
  const { theme } = useUnistyles();
  const selectedIndex = options.findIndex((opt) => opt.value === value);

  return (
    <Host matchContents accessibilityLabel={ariaLabel}>
      <NativeSegmentedControl
        values={options.map((opt) => opt.label)}
        selectedIndex={selectedIndex === -1 ? undefined : selectedIndex}
        onChange={(event) => {
          const opt = options[event.nativeEvent.selectedSegmentIndex];
          if (opt) onChange(opt.value);
        }}
        tintColor={theme.colors.action.primary}
      />
    </Host>
  );
}
