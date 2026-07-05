import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useAccountProfile, useUpdateProfile } from "@sd/domain-account";
import { AppText } from "@/shared/components/AppText/AppText";
import { useTranslation } from "@/core/i18n/use-translation";

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
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");

  const unchanged = displayName === profile.displayName;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppText variant="titleLg" style={styles.title}>
        {t("account.editProfile", "Edit Profile")}
      </AppText>
      <View style={styles.form}>
        <View style={styles.field}>
          <AppText variant="labelMd">{t("account.displayName", "Display Name")}</AppText>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t("account.displayNamePlaceholder", "Your display name")}
            placeholderTextColor={theme.colors.content.muted}
            style={styles.input}
          />
        </View>
        <View style={styles.field}>
          <AppText variant="labelMd">{t("account.email", "Email")}</AppText>
          <TextInput
            value={profile.email}
            editable={false}
            style={[styles.input, styles.inputDisabled]}
          />
        </View>
      </View>
      <View style={styles.actions}>
        {isError && (
          <AppText variant="caption" style={{ color: theme.colors.state.dangerContent }}>
            {t("account.saveFailed", "Failed to save. Please try again.")}
          </AppText>
        )}
        {isSuccess && (
          <AppText variant="caption" style={{ color: theme.colors.state.successContent }}>
            {t("account.saved", "Saved.")}
          </AppText>
        )}
        <Pressable
          onPress={() => updateProfile({ displayName })}
          disabled={isPending || unchanged}
          style={[styles.saveButton, (isPending || unchanged) && styles.saveButtonDisabled]}
        >
          <AppText variant="bodyMd" style={{ color: theme.colors.content.onPrimary }}>
            {isPending ? t("account.saving", "Saving…") : t("account.save", "Save")}
          </AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

export function AccountProfileScreen(_props: AccountProfileScreenProps) {
  const { t } = useTranslation();
  const { data: profile, isFetching } = useAccountProfile();
  const { mutate: updateProfile, isPending, isSuccess, isError } = useUpdateProfile();

  if (isFetching) {
    return (
      <View style={styles.centered}>
        <AppText variant="bodyMd">{t("account.loadingProfile", "Loading profile...")}</AppText>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <AppText variant="bodyMd">{t("account.profileUnavailable", "Profile not available")}</AppText>
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
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingVertical: theme.spacing.layout.pageY,
  },
  title: {
    color: theme.colors.content.strong,
  },
  form: {
    marginTop: theme.spacing.scale.xl,
    gap: theme.spacing.component.gapLg,
  },
  field: {
    gap: theme.spacing.scale.xs,
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
}));
