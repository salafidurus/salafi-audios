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
    borderTopLeftRadius: theme.radius.scale.lg,
    borderTopRightRadius: theme.radius.scale.lg,
    padding: theme.spacing.scale.lg,
    maxHeight: "80%",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: theme.spacing.scale.lg,
    color: theme.colors.content.strong,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: theme.spacing.scale.xs,
    color: theme.colors.content.default,
  },
  labelSpacingTop: {
    marginTop: theme.spacing.scale.md,
  },
  channelOption: {
    paddingVertical: theme.spacing.scale.sm,
    paddingHorizontal: theme.spacing.scale.md,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.scale.sm,
    marginBottom: theme.spacing.scale.xs,
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
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.scale.sm,
    paddingVertical: theme.spacing.scale.sm,
    paddingHorizontal: theme.spacing.scale.md,
    marginBottom: theme.spacing.scale.md,
    color: theme.colors.content.default,
  },
  inputSpacingBottom: {
    marginBottom: theme.spacing.scale.md,
  },
  errorText: {
    color: theme.colors.state.danger,
    marginBottom: theme.spacing.scale.sm,
  },
  buttonRow: {
    flexDirection: "row",
    gap: theme.spacing.scale.sm,
    marginTop: theme.spacing.scale.md,
  },
  saveBtn: {
    flex: 1,
    padding: theme.spacing.scale.md,
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radius.scale.sm,
    alignItems: "center",
  },
  saveBtnText: {
    color: theme.colors.content.onPrimary,
    fontWeight: "600",
  },
  cancelBtn: {
    padding: theme.spacing.scale.md,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.scale.sm,
    alignItems: "center",
  },
  cancelBtnText: {
    color: theme.colors.content.default,
  },
}));
