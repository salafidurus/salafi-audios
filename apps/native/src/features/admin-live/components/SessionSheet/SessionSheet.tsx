import { useReducer } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
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
  const { theme } = useUnistyles();
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
        {/* react-doctor-disable-next-line react-doctor/rn-no-scrollview-mapped-list */}
        {channels.map((ch) => (
          <Pressable
            key={ch.id}
            onPress={() => dispatch({ channelId: ch.id })}
            style={[styles.channelOption, channelId === ch.id && styles.channelOptionSelected]}
          >
            <Text style={styles.channelOptionText}>{ch.displayName}</Text>
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
          placeholderTextColor={theme.colors.content.muted}
          style={[styles.input, styles.inputSpacingBottom]}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
      <View style={styles.buttonRow}>
        <Pressable onPress={handleSave} disabled={isSaving} style={styles.saveBtn}>
          {isSaving ? (
            <ActivityIndicator color={theme.colors.content.onPrimary} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </Pressable>
        <Pressable onPress={onClose} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface.elevated,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "80%",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 16,
    color: theme.colors.content.strong,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    color: theme.colors.content.default,
  },
  labelSpacingTop: {
    marginTop: 12,
  },
  channelOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: theme.colors.surface.default,
  },
  channelOptionSelected: {
    borderColor: theme.colors.action.primary,
    backgroundColor: theme.colors.surface.primarySubtle,
  },
  channelOptionText: {
    color: theme.colors.content.default,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: theme.colors.content.default,
  },
  inputSpacingBottom: {
    marginBottom: 12,
  },
  errorText: {
    color: theme.colors.state.danger,
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
    backgroundColor: theme.colors.action.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: {
    color: theme.colors.content.onPrimary,
    fontWeight: "600",
  },
  cancelBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtnText: {
    color: theme.colors.content.default,
  },
}));
