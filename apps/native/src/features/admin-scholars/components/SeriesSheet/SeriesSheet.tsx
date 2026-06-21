import { useReducer } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { AdminSeriesDetailDto } from "@sd/core-contracts";
import { createSeries, updateSeries } from "../../api/admin-scholars.api";

type SeriesSheetProps = {
  isOpen: boolean;
  scholarId: string;
  series?: AdminSeriesDetailDto;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  title: string;
  description: string;
  language: string;
  isSaving: boolean;
  error: string | null;
};

function reduce(state: FormState, patch: Partial<FormState>): FormState {
  return { ...state, ...patch };
}

export function SeriesSheet({ isOpen, scholarId, series, onClose, onSaved }: SeriesSheetProps) {
  const { theme } = useUnistyles();
  const [state, dispatch] = useReducer(reduce, {
    title: series?.title ?? "",
    description: series?.description ?? "",
    language: series?.language ?? "",
    isSaving: false,
    error: null,
  });

  if (!isOpen) return null;

  const { title, description, language, isSaving, error } = state;

  const handleSave = async () => {
    if (!title.trim()) {
      dispatch({ error: "Title is required" });
      return;
    }
    dispatch({ isSaving: true, error: null });
    try {
      if (series) {
        await updateSeries(series.id, {
          title,
          description: description || undefined,
          language: language || undefined,
        });
      } else {
        await createSeries({
          scholarId,
          title,
          description: description || undefined,
          language: language || undefined,
        });
      }
      onSaved();
    } catch (e) {
      dispatch({ error: (e as Error).message });
    } finally {
      dispatch({ isSaving: false });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{series ? "Edit Series" : "New Series"}</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          value={title}
          onChangeText={(v) => dispatch({ title: v })}
          style={styles.input}
        />
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={(v) => dispatch({ description: v })}
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <Text style={styles.label}>Language</Text>
        <TextInput
          value={language}
          onChangeText={(v) => dispatch({ language: v })}
          placeholder="e.g. ar, en"
          placeholderTextColor={theme.colors.content.muted}
          style={styles.input}
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
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: theme.colors.content.default,
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
