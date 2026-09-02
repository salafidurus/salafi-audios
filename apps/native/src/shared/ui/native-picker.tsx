import { Picker, type PickerItemValue } from "@expo/ui";

/** Provides a platform-native single-selection picker adapter. */

/**
 * A picker option whose stable value is returned to the caller, independent
 * of the platform-specific label and menu presentation.
 */
export type NativePickerOption<T extends PickerItemValue = PickerItemValue> = {
  label: string;
  value: T;
};

/** Defines the controlled single-selection picker contract. */
export type NativePickerProps<T extends PickerItemValue = PickerItemValue> = {
  /** The selected option; it must match one option value. */
  selectedValue: T;
  options: NativePickerOption<T>[];
  /** Reports a selection while leaving state ownership with the caller. */
  onValueChange: (value: T) => void;
  appearance?: "wheel" | "menu";
  enabled?: boolean;
  testID?: string;
};

/** Maps semantic option data to the platform-native Expo UI picker. */
export function NativePicker<T extends PickerItemValue>({
  selectedValue,
  options,
  onValueChange,
  appearance = "menu",
  enabled = true,
  testID,
}: NativePickerProps<T>) {
  return (
    <Picker
      selectedValue={selectedValue}
      onValueChange={onValueChange}
      appearance={appearance}
      enabled={enabled}
      testID={testID}
    >
      {options.map((option) => (
        <Picker.Item key={String(option.value)} label={option.label} value={option.value} />
      ))}
    </Picker>
  );
}
