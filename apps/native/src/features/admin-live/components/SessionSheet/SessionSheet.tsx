import { useReducer } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { LivestreamChannelDto } from "@sd/core-contracts";
import { createSession } from "../../api/admin-live.api";

type SessionSheetProps = {
  isOpen: boolean;
  channels: LivestreamChannelDto[];
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  channelId: string;
  title: string;
  scheduledAt: string;
  isSaving: boolean;
  error: string | null;
};

function reduce(state: FormState, patch: Partial<FormState>): FormState {
  return { ...state, ...patch };
}

export function SessionSheet({ isOpen, channels, onClose, onSaved }: SessionSheetProps) {
  const [state, dispatch] = useReducer(reduce, {
    channelId: channels[0]?.id ?? "",
    title: "",
    scheduledAt: "",
    isSaving: false,
    error: null,
  });

  if (!isOpen) return null;

  const { channelId, title, scheduledAt, isSaving, error } = state;

  const handleSave = async () => {
    if (!channelId) {
      dispatch({ error: "Channel is required" });
      return;
    }
    dispatch({ isSaving: true, error: null });
    try {
      await createSession({
        channelId,
        title: title || undefined,
        scheduledAt: scheduledAt || undefined,
      });
      onSaved();
    } catch (e) {
      dispatch({ error: (e as Error).message });
    } finally {
      dispatch({ isSaving: false });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Session</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Channel *</Text>
        {channels.map((ch) => (
          <Pressable
            key={ch.id}
            onPress={() => dispatch({ channelId: ch.id })}
            style={[styles.channelOption, channelId === ch.id && styles.channelOptionSelected]}
          >
            <Text>{ch.displayName}</Text>
          </Pressable>
        ))}
        <Text style={[styles.label, styles.labelSpacingTop]}>Title (optional)</Text>
        <TextInput
          value={title}
          onChangeText={(v) => dispatch({ title: v })}
          style={styles.input}
        />
        <Text style={styles.label}>Scheduled At (ISO, optional)</Text>
        <TextInput
          value={scheduledAt}
          onChangeText={(v) => dispatch({ scheduledAt: v })}
          placeholder="e.g. 2026-07-01T18:00:00Z"
          style={[styles.input, styles.inputSpacingBottom]}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
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
    maxHeight: "80%",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  labelSpacingTop: {
    marginTop: 12,
  },
  channelOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "#fff",
  },
  channelOptionSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  inputSpacingBottom: {
    marginBottom: 12,
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
