"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Pressable, TextInput, type TextInput as RNTextInput, View } from "react-native";
import { ChevronLeft, X } from "lucide-react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

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
    const [backPressed, setBackPressed] = useState(false);
    const [clearPressed, setClearPressed] = useState(false);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    return (
      <View style={styles.container}>
        <Pressable
          onPress={onBackPress}
          onPressIn={() => setBackPressed(true)}
          onPressOut={() => setBackPressed(false)}
          style={styles.iconButton}
        >
          <ChevronLeft
            size={20}
            color={backPressed ? theme.colors.content.primary : theme.colors.content.muted}
          />
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

        {value && value.length > 0 ? (
          <Pressable
            onPress={() => onChange?.("")}
            onPressIn={() => setClearPressed(true)}
            onPressOut={() => setClearPressed(false)}
            style={styles.iconButton}
          >
            <X
              size={20}
              color={clearPressed ? theme.colors.content.primary : theme.colors.content.muted}
            />
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
    _web: {
      paddingHorizontal: theme.spacing.scale.lg,
      paddingVertical: theme.spacing.scale.md,
    },
  },
  iconButton: {
    _web: {
      paddingVertical: theme.spacing.scale.xs,
    },
  },
  input: {
    flex: 1,
    padding: 0,
    color: theme.colors.content.default,
    _web: {
      ...theme.typography.bodyMd,
      lineHeight: String(theme.typography.bodyMd.lineHeight),
    },
  },
}));
