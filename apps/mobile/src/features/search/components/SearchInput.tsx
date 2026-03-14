import React, { forwardRef, useImperativeHandle } from "react";
import { TextInput, View, Pressable } from "react-native";
import { ArrowLeft, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type SearchInputProps = {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
};

export type SearchInputRef = {
  focus: () => void;
};

export const SearchInput = forwardRef<SearchInputRef, SearchInputProps>(
  ({ placeholder, value, onChange }, ref) => {
    const router = useRouter();
    const { theme } = useUnistyles();
    const inputRef = React.useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    const handleClear = () => {
      onChange?.("");
    };

    const handleBack = () => {
      if (router.canGoBack()) {
        router.back();
      }
    };

    return (
      <View style={styles.container}>
        <Pressable onPress={handleBack} style={styles.iconButton}>
          <ArrowLeft size={20} color={theme.colors.content.muted} strokeWidth={2} />
        </Pressable>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.content.muted}
          value={value}
          onChangeText={onChange}
          autoFocus
        />
        {value && value.length > 0 && (
          <Pressable onPress={handleClear} style={styles.iconButton}>
            <X size={20} color={theme.colors.content.muted} strokeWidth={2} />
          </Pressable>
        )}
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
    backgroundColor: theme.colors.surface.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.panelSm,
    paddingHorizontal: theme.spacing.scale.lg,
    paddingVertical: theme.spacing.scale.md,
  },
  iconButton: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.bodyMd.fontFamily,
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
    letterSpacing: theme.typography.bodyMd.letterSpacing,
    padding: 0,
    color: theme.colors.content.default,
  },
}));
