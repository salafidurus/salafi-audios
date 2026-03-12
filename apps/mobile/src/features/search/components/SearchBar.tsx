import { StyleSheet, TextInput, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

export type SearchBarProps = {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
  const { theme } = useUnistyles();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.gapMd,
        backgroundColor: theme.colors.surfaceSoft,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.chip,
        paddingHorizontal: theme.spacing.spaceMd,
        paddingVertical: theme.spacing.spaceSm,
      }}
    >
      <View
        style={{
          position: "relative",
          width: 16,
          height: 16,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: theme.colors.textMuted,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: 5,
            height: 2,
            bottom: 0,
            right: -2,
            borderRadius: 1,
            backgroundColor: theme.colors.textMuted,
            transform: [{ rotate: "45deg" }],
          }}
        />
      </View>
      <TextInput
        style={{
          flex: 1,
          fontSize: 16,
          padding: 0,
          color: theme.colors.text,
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
