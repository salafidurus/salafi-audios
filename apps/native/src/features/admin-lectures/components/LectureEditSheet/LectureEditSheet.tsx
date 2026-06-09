import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { AdminLectureDetailDto } from "@sd/core-contracts";
import { fetchAdminLectureDetail, updateLecture } from "../../api/admin-lectures.api";

type LectureEditSheetProps = {
  lectureId: string | null;
  onClose: () => void;
  onSaved: () => void;
};

export function LectureEditSheet({ lectureId, onClose, onSaved }: LectureEditSheetProps) {
  const [lecture, setLecture] = useState<AdminLectureDetailDto | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lectureId) {
      setLecture(null);
      return;
    }
    fetchAdminLectureDetail(lectureId).then((data) => {
      setLecture(data);
      setTitle(data.title ?? "");
      setDescription((data as any).description ?? "");
      setLanguage((data as any).language ?? "");
    });
  }, [lectureId]);

  if (!lectureId) return null;

  const handleSave = async () => {
    if (!lecture) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateLecture(lecture.id, {
        title,
        ...(description ? { description } : {}),
        ...(language ? { language: language as any } : {}),
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
        maxHeight: "85%",
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 16 }}>Edit Lecture</Text>
      {!lecture ? (
        <ActivityIndicator style={{ marginVertical: 32 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={{ fontSize: 13, fontWeight: "600", marginBottom: 4 }}>Title</Text>
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
          <Text style={{ fontSize: 13, fontWeight: "600", marginBottom: 4 }}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              padding: 10,
              marginBottom: 12,
            }}
          />
          <Text style={{ fontSize: 13, fontWeight: "600", marginBottom: 4 }}>Language</Text>
          <TextInput
            value={language}
            onChangeText={setLanguage}
            placeholder="e.g. ar, en"
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              padding: 10,
              marginBottom: 12,
            }}
          />
          <Text style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
            Status: {lecture.status}
          </Text>
          {error && <Text style={{ color: "#dc2626", marginBottom: 8 }}>{error}</Text>}
        </ScrollView>
      )}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <Pressable
          onPress={handleSave}
          disabled={isSaving || !lecture}
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
