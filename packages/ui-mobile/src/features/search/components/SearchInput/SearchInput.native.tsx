import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Pressable, TextInput } from "react-native";
import { ChevronLeft as ChevronLeftIcon, X as XIcon } from "lucide-react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

// moduleSuffixes causes lucide types to resolve react-native-svg web types (missing color prop)
const ChevronLeft = ChevronLeftIcon as React.ComponentType<{ size: number; color: string }>;
const X = XIcon as React.ComponentType<{ size: number; color: string }>;

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
    const inputRef = React.useRef<TextInput>(null);
    const [backPressed, setBackPressed] = useState(false);
    const [clearPressed, setClearPressed] = useState(false);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

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

        {value && value.length > 0 ? (
          <EaseView
            animate={{
              scale: clearPressed ? 0.9 : 1,
              opacity: clearPressed ? 0.7 : 1,
            }}
            transition={{ type: "spring", damping: 10, stiffness: 200 }}
          >
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
          </EaseView>
        ) : null}
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
    paddingVertical: theme.spacing.scale.xs,
  },
  input: {
    flex: 1,
    ...theme.typography.bodyMd,
    padding: 0,
    color: theme.colors.content.default,
  },
}));
