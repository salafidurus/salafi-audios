"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { type TextInput as RNTextInput } from "react-native";
import { ChevronLeft, X } from "lucide-react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Pressable } from "react-native-unistyles/components/native/Pressable";
import { TextInput } from "react-native-unistyles/components/native/TextInput";
import { View } from "react-native-unistyles/components/native/View";

export type SearchInputMobileWebProps = {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  onBackPress?: () => void;
};

export type SearchInputMobileWebRef = {
  focus: () => void;
};

export const SearchInputMobileWeb = forwardRef<SearchInputMobileWebRef, SearchInputMobileWebProps>(
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

SearchInputMobileWeb.displayName = "SearchInputMobileWeb";

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
