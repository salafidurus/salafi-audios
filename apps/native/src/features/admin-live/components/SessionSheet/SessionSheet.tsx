import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { LivestreamChannelDto } from "@sd/core-contracts";
import { createSession } from "../../api/admin-live.api";

type SessionSheetProps = {
  isOpen: boolean;
  channels: LivestreamChannelDto[];
  onClose: () => void;
  onSaved: () => void;
};

export function SessionSheet({ isOpen, channels, onClose, onSaved }: SessionSheetProps) {
  const [channelId, setChannelId] = useState(channels[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!channelId) {
      setError("Channel is required");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await createSession({
        channelId,
        title: title || undefined,
        scheduledAt: scheduledAt || undefined,
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

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
        maxHeight: "80%",
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 16 }}>New Session</Text>
      <ScrollView>
        <Text style={{ fontSize: 13, fontWeight: "600", marginBottom: 4 }}>Channel *</Text>
        {channels.map((ch) => (
          <Pressable
            key={ch.id}
            onPress={() => setChannelId(ch.id)}
            style={{
              padding: 10,
              borderWidth: 1,
              borderColor: channelId === ch.id ? "#3b82f6" : "#d1d5db",
              borderRadius: 8,
              marginBottom: 4,
              backgroundColor: channelId === ch.id ? "#eff6ff" : "#fff",
            }}
          >
            <Text>{ch.displayName}</Text>
          </Pressable>
        ))}
        <Text style={{ fontSize: 13, fontWeight: "600", marginTop: 12, marginBottom: 4 }}>
          Title (optional)
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={{
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 8,
            padding: 10,
            marginBottom: 12,
          }}
        />
        <Text style={{ fontSize: 13, fontWeight: "600", marginBottom: 4 }}>
          Scheduled At (ISO, optional)
        </Text>
        <TextInput
          value={scheduledAt}
          onChangeText={setScheduledAt}
          placeholder="e.g. 2026-07-01T18:00:00Z"
          style={{
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 8,
            padding: 10,
            marginBottom: 12,
          }}
        />
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
