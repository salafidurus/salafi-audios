import React, { forwardRef, useImperativeHandle, useState } from "react";
import { TextInput, View, Pressable } from "react-native";
import { ArrowLeft, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { EaseView } from "react-native-ease";

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
    const [backPressed, setBackPressed] = useState(false);
    const [clearPressed, setClearPressed] = useState(false);

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
      <EaseView
        initialAnimate={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 120 }}
        style={styles.container}
      >
        <EaseView
          animate={{
            scale: backPressed ? 0.9 : 1,
            opacity: backPressed ? 0.7 : 1,
          }}
          transition={{ type: "spring", damping: 10, stiffness: 200 }}
        >
          <Pressable
            onPress={handleBack}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
            style={styles.iconButton}
          >
            <ArrowLeft
              size={20}
              color={backPressed ? theme.colors.content.primary : theme.colors.content.muted}
              strokeWidth={2}
            />
          </Pressable>
        </EaseView>
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
          <EaseView
            animate={{
              scale: clearPressed ? 0.9 : 1,
              opacity: clearPressed ? 0.7 : 1,
            }}
            transition={{ type: "spring", damping: 10, stiffness: 200 }}
          >
            <Pressable
              onPress={handleClear}
              onPressIn={() => setClearPressed(true)}
              onPressOut={() => setClearPressed(false)}
              style={styles.iconButton}
            >
              <X
                size={20}
                color={clearPressed ? theme.colors.content.primary : theme.colors.content.muted}
                strokeWidth={2}
              />
            </Pressable>
          </EaseView>
        )}
      </EaseView>
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
