import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { AdminCollectionDetailDto } from "@sd/core-contracts";
import { createCollection, updateCollection } from "../../api/admin-scholars.api";

type CollectionSheetProps = {
  isOpen: boolean;
  scholarId: string;
  collection?: AdminCollectionDetailDto;
  onClose: () => void;
  onSaved: () => void;
};

export function CollectionSheet({
  isOpen,
  scholarId,
  collection,
  onClose,
  onSaved,
}: CollectionSheetProps) {
  const [title, setTitle] = useState(collection?.title ?? "");
  const [description, setDescription] = useState(collection?.description ?? "");
  const [language, setLanguage] = useState(collection?.language ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setIsSaving(true);
    setError(null);
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
      <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 16 }}>
        {collection ? "Edit Collection" : "New Collection"}
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 13, fontWeight: "600", marginBottom: 4 }}>Title *</Text>
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
