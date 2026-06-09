import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
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

export function ChannelSheet({ isOpen, channel, onClose, onSaved }: ChannelSheetProps) {
  const [telegramId, setTelegramId] = useState("");
  const [displayName, setDisplayName] = useState(channel?.displayName ?? "");
  const [telegramSlug, setTelegramSlug] = useState(channel?.telegramSlug ?? "");
  const [language, setLanguage] = useState(channel?.language ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!displayName) {
      setError("Display Name is required");
      return;
    }
    if (!channel && !telegramId) {
      setError("Telegram ID is required for new channels");
      return;
    }
    setIsSaving(true);
    setError(null);
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
      setError((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const fields: {
    key: keyof typeof HELPER_TEXT;
    label: string;
    value: string;
    set: (v: string) => void;
    keyboardType?: "default" | "numeric";
    showInEditMode?: boolean;
  }[] = [
    {
      key: "telegramId",
      label: "Telegram ID *",
      value: telegramId,
      set: setTelegramId,
      keyboardType: "numeric",
      showInEditMode: false,
    },
    { key: "displayName", label: "Display Name *", value: displayName, set: setDisplayName },
    { key: "telegramSlug", label: "Telegram Slug", value: telegramSlug, set: setTelegramSlug },
    { key: "language", label: "Language", value: language, set: setLanguage },
  ];

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        maxHeight: "90%",
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 16 }}>
        {channel ? "Edit Channel" : "New Channel"}
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {fields
          .filter((f) => f.showInEditMode !== false || !channel)
          .map(({ key, label, value, set, keyboardType }) => (
            <View key={key} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", marginBottom: 4 }}>{label}</Text>
              <TextInput
                value={value}
                onChangeText={set}
                keyboardType={keyboardType ?? "default"}
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 14,
                }}
              />
              <Text style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                {HELPER_TEXT[key]}
              </Text>
            </View>
          ))}
        {error && <Text style={{ color: "#dc2626", marginBottom: 8 }}>{error}</Text>}
      </ScrollView>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: "#3b82f6",
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "600" }}>Save</Text>
          )}
        </Pressable>
        <Pressable
          onPress={onClose}
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
