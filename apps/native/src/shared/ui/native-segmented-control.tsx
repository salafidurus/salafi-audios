import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { useUnistyles } from "react-native-unistyles";

/** Defines the controlled semantic segmented-control contract. */
/** Values remain caller-controlled; native selection reports through the callback. */
export type NativeSegmentedControlProps = {
  values: string[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  testID?: string;
};

/** Maps controlled values to the platform-native segmented control. */
export function NativeSegmentedControl({
  values,
  value,
  onValueChange,
  disabled = false,
  testID,
}: NativeSegmentedControlProps) {
  const { theme, rt } = useUnistyles();
  return (
    <SegmentedControl
      values={values}
      selectedIndex={Math.max(values.indexOf(value), 0)}
      enabled={!disabled}
      onValueChange={onValueChange}
      tintColor={theme.colors.action.primary}
      appearance={rt.themeName === "system" ? undefined : rt.themeName}
      testID={testID}
    />
  );
}
