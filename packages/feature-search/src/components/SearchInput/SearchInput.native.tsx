import React, { forwardRef, useImperativeHandle } from "react";
import { Pressable, TextInput as RNTextInput, View } from "react-native";
import { ChevronLeft, X } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { ComponentType } from "react";

export type SearchInputProps = {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  onBackPress?: () => void;
};

export type SearchInputRef = {
  focus: () => void;
};

export const SearchInput = forwardRef<SearchInputRef, SearchInputProps>(
  ({ placeholder, value, onChange, onBackPress }, ref) => {
    const { theme } = useUnistyles();
    const inputRef = React.useRef<RNTextInput>(null);
    const BackIcon = ChevronLeft as ComponentType<{
      size?: number;
      strokeWidth?: number;
      color?: string;
    }>;
    const ClearIcon = X as ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    return (
      <View style={styles.container}>
        <Pressable onPress={onBackPress} style={styles.iconButton}>
          <BackIcon size={20} color={theme.colors.content.muted} />
        </Pressable>

        <RNTextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.content.muted}
          value={value}
          onChangeText={onChange}
          autoFocus
        />

        {value ? (
          <Pressable onPress={() => onChange?.("")} style={styles.iconButton}>
            <ClearIcon size={20} color={theme.colors.content.muted} />
          </Pressable>
        ) : null}
      </View>
    );
  },
);

SearchInput.displayName = "SearchInput";

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapMd,
    backgroundColor: theme.colors.surface.default,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.panelSm,
    paddingHorizontal: theme.spacing.scale.lg,
    paddingVertical: theme.spacing.scale.md,
  },
  iconButton: {
    paddingVertical: theme.spacing.scale.xs,
  },
  input: {
    flex: 1,
    padding: 0,
    color: theme.colors.content.default,
    ...theme.typography.bodyMd,
  },
}));
