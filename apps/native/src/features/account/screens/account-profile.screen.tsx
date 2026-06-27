import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useAccountProfile, useUpdateProfile } from "@sd/domain-account";

export type AccountProfileScreenProps = {
  onBack?: () => void;
};

type AccountProfileFormProps = {
  profile: NonNullable<ReturnType<typeof useAccountProfile>["data"]>;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  updateProfile: ReturnType<typeof useUpdateProfile>["mutate"];
};

function AccountProfileForm({
  profile,
  isPending,
  isSuccess,
  isError,
  updateProfile,
}: AccountProfileFormProps) {
  const { theme } = useUnistyles();
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");

  const unchanged = displayName === profile.displayName;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit Profile</Text>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your display name"
            placeholderTextColor={theme.colors.content.muted}
            style={styles.input}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={profile.email}
            editable={false}
            style={[styles.input, styles.inputDisabled]}
          />
        </View>
      </View>
      <View style={styles.actions}>
        {isError && <Text style={styles.errorText}>Failed to save. Please try again.</Text>}
        {isSuccess && <Text style={styles.successText}>Saved.</Text>}
        <Pressable
          onPress={() => updateProfile({ displayName })}
          disabled={isPending || unchanged}
          style={[styles.saveButton, (isPending || unchanged) && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{isPending ? "Saving…" : "Save"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

export function AccountProfileScreen(_props: AccountProfileScreenProps) {
  const { data: profile, isFetching } = useAccountProfile();
  const { mutate: updateProfile, isPending, isSuccess, isError } = useUpdateProfile();

  if (isFetching) {
    return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>Profile not available</Text>
      </View>
    );
  }

  return (
    <AccountProfileForm
      profile={profile}
      isPending={isPending}
      isSuccess={isSuccess}
      isError={isError}
      updateProfile={updateProfile}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    color: theme.colors.content.default,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingVertical: theme.spacing.layout.pageY,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.content.strong,
  },
  form: {
    marginTop: theme.spacing.scale.xl,
    gap: theme.spacing.component.gapLg,
  },
  field: {
    gap: theme.spacing.scale.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.content.default,
  },
  input: {
    paddingVertical: theme.spacing.scale.sm,
    paddingHorizontal: theme.spacing.scale.md,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.scale.sm,
    fontSize: 14,
    color: theme.colors.content.default,
  },
  inputDisabled: {
    backgroundColor: theme.colors.surface.subtle,
  },
  actions: {
    marginTop: theme.spacing.scale.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.md,
  },
  saveButton: {
    paddingVertical: theme.spacing.scale.sm,
    paddingHorizontal: theme.spacing.scale.xl,
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radius.scale.sm,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.content.onPrimary,
  },
  successText: {
    fontSize: 12,
    color: theme.colors.state.successContent,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.state.dangerContent,
  },
}));
