import { useCallback, useReducer } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { LivestreamChannelDto, Locale } from "@sd/core-contracts";
import { createChannel, updateChannel } from "../../api/admin-live.api";

const HELPER_TEXT = {
  telegramId:
    "The numeric channel ID from Telegram (e.g. -1001234567890). Find it by forwarding a message from the channel to @userinfobot.",
  displayName: "The name shown to users in the app. Can differ from the Telegram channel name.",
  telegramSlug:
    "The channel's public username without the @ (e.g. duruschannel). Leave blank if the channel is private.",
  language: "Locale code for this channel's primary language (e.g. ar, en).",
} as const;

type ChannelSheetProps = {
  isOpen: boolean;
  channel?: LivestreamChannelDto;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  telegramId: string;
  displayName: string;
  telegramSlug: string;
  language: string;
  isSaving: boolean;
  error: string | null;
};

function reduce(state: FormState, patch: Partial<FormState>): FormState {
  return { ...state, ...patch };
}

type FieldItem = {
  key: keyof typeof HELPER_TEXT;
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: "default" | "numeric";
};

export function ChannelSheet({ isOpen, channel, onClose, onSaved }: ChannelSheetProps) {
  const [state, dispatch] = useReducer(reduce, {
    telegramId: "",
    displayName: channel?.displayName ?? "",
    telegramSlug: channel?.telegramSlug ?? "",
    language: channel?.language ?? "",
    isSaving: false,
    error: null,
  });

  const { telegramId, displayName, telegramSlug, language, isSaving, error } = state;

  const handleSave = async () => {
    if (!displayName) {
      dispatch({ error: "Display Name is required" });
      return;
    }
    if (!channel && !telegramId) {
      dispatch({ error: "Telegram ID is required for new channels" });
      return;
    }
    dispatch({ isSaving: true, error: null });
    try {
      if (channel) {
        await updateChannel(channel.id, {
          displayName,
          telegramSlug: telegramSlug || undefined,
          language: (language as Locale) || undefined,
        });
      } else {
        await createChannel({
          telegramId,
          displayName,
          telegramSlug: telegramSlug || undefined,
          language: (language as Locale) || undefined,
        });
      }
      onSaved();
    } catch (e) {
      dispatch({ error: (e as Error).message });
    } finally {
      dispatch({ isSaving: false });
    }
  };

  const allFields: FieldItem[] = [
    {
      key: "telegramId",
      label: "Telegram ID *",
      value: telegramId,
      onChangeText: (v) => dispatch({ telegramId: v }),
      keyboardType: "numeric",
    },
    {
      key: "displayName",
      label: "Display Name *",
      value: displayName,
      onChangeText: (v) => dispatch({ displayName: v }),
    },
    {
      key: "telegramSlug",
      label: "Telegram Slug",
      value: telegramSlug,
      onChangeText: (v) => dispatch({ telegramSlug: v }),
    },
    {
      key: "language",
      label: "Language",
      value: language,
      onChangeText: (v) => dispatch({ language: v }),
    },
  ];

  const fields = allFields.flatMap((f) => (f.key !== "telegramId" || !channel ? [f] : []));

  const renderFieldItem = useCallback(
    ({ item: { key, label, value, onChangeText, keyboardType } }: { item: FieldItem }) => (
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType ?? "default"}
          style={styles.input}
        />
        <Text style={styles.helperText}>{HELPER_TEXT[key]}</Text>
      </View>
    ),
    [],
  );

  if (!isOpen) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{channel ? "Edit Channel" : "New Channel"}</Text>
      <FlatList
        data={fields}
        keyExtractor={(f) => f.key}
        showsVerticalScrollIndicator={false}
        renderItem={renderFieldItem}
        ListFooterComponent={error ? <Text style={styles.errorText}>{error}</Text> : null}
      />
      <View style={styles.buttonRow}>
        <Pressable onPress={handleSave} disabled={isSaving} style={styles.saveBtn}>
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </Pressable>
        <Pressable onPress={onClose} style={styles.cancelBtn}>
          <Text>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "90%",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 16,
  },
  fieldRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  saveBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
  },
});
