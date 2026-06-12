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
import type { AdminCollectionDetailDto } from "@sd/core-contracts";
import { createCollection, updateCollection } from "../../api/admin-scholars.api";

type CollectionSheetProps = {
  isOpen: boolean;
  scholarId: string;
  collection?: AdminCollectionDetailDto;
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

export function CollectionSheet({
  isOpen,
  scholarId,
  collection,
  onClose,
  onSaved,
}: CollectionSheetProps) {
  const [state, dispatch] = useReducer(reduce, {
    title: collection?.title ?? "",
    description: collection?.description ?? "",
    language: collection?.language ?? "",
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
      if (collection) {
        await updateCollection(collection.id, {
          title,
          description: description || undefined,
          language: language || undefined,
        });
      } else {
        await createCollection({
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
      <Text style={styles.title}>{collection ? "Edit Collection" : "New Collection"}</Text>
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
          style={styles.input}
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
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
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
