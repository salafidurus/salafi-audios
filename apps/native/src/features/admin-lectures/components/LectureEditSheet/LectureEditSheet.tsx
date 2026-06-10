import { useEffect, useReducer } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { AdminLectureDetailDto, Locale } from "@sd/core-contracts";
import { fetchAdminLectureDetail, updateLecture } from "../../api/admin-lectures.api";

type LectureEditSheetProps = {
  lectureId: string | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  lecture: AdminLectureDetailDto | null;
  title: string;
  description: string;
  language: string;
  isSaving: boolean;
  error: string | null;
};

function reduce(state: FormState, patch: Partial<FormState>): FormState {
  return { ...state, ...patch };
}

export function LectureEditSheet({ lectureId, onClose, onSaved }: LectureEditSheetProps) {
  const [state, dispatch] = useReducer(reduce, {
    lecture: null,
    title: "",
    description: "",
    language: "",
    isSaving: false,
    error: null,
  });

  useEffect(() => {
    // eslint-disable-next-line react-doctor/no-event-handler
    if (!lectureId) {
      dispatch({ lecture: null });
      return;
    }
    fetchAdminLectureDetail(lectureId).then((data) => {
      dispatch({
        lecture: data,
        title: data.title ?? "",
        description: data.description ?? "",
        language: data.language ?? "",
      });
    });
  }, [lectureId]);

  if (!lectureId) return null;

  const { lecture, title, description, language, isSaving, error } = state;

  const handleSave = async () => {
    if (!lecture) return;
    dispatch({ isSaving: true, error: null });
    try {
      await updateLecture(lecture.id, {
        title,
        ...(description ? { description } : {}),
        ...(language ? { language: language as Locale } : {}),
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
      <Text style={styles.title}>Edit Lecture</Text>
      {!lecture ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Title</Text>
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
          <Text style={styles.statusText}>Status: {lecture.status}</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>
      )}
      <View style={styles.buttonRow}>
        <Pressable onPress={handleSave} disabled={isSaving || !lecture} style={styles.saveBtn}>
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
    maxHeight: "85%",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 16,
  },
  loader: {
    marginVertical: 32,
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
  statusText: {
    fontSize: 12,
    color: "#6b7280",
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
