import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { useUnistyles } from "react-native-unistyles";

export type NativeSegmentedControlProps = {
  values: string[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  testID?: string;
};

export function NativeSegmentedControl({
  values,
  value,
  onValueChange,
  disabled = false,
  testID,
}: NativeSegmentedControlProps) {
  const { theme } = useUnistyles();
  const selectedIndex = Math.max(values.indexOf(value), 0);

  return (
    <SegmentedControl
      values={values}
      selectedIndex={selectedIndex}
      enabled={!disabled}
      onValueChange={onValueChange}
      tintColor={theme.colors.action.primary}
      appearance={theme.mode}
      testID={testID}
    />
  );
}
