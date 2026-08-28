import { useAccountProfile, useUpdateProfile } from "@sd/domain-account";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components/AppText/AppText";
import { TextInput } from "@/shared/components/TextInput/TextInput";

import { SettingsRow } from "../components/SettingsRow/SettingsRow";
import { SettingsSection } from "../components/SettingsSection/SettingsSection";
import { getRtlAwareTextAlign } from "../utils/rtl-text-align";

/** Provides native account, preference, support, and settings workflows. */
/** Describes the inputs, callbacks, and optional state accepted by Account Profile Screen. */
export type AccountProfileScreenProps = {
  onBack?: () => void;
};

type AccountProfileFormProps = {
  profile: NonNullable<ReturnType<typeof useAccountProfile>["data"]>;
  isPending: boolean;
  isSuccess: boolean;
  /** Indicates that the associated request or operation failed and should render its error state. */
  isError: boolean;
  updateProfile: ReturnType<typeof useUpdateProfile>["mutate"];
};

type AccountProfileActionsProps = Pick<
  AccountProfileFormProps,
  "isPending" | "isSuccess" | "isError" | "updateProfile"
> & {
  displayName: string;
  unchanged: boolean;
};

function AccountProfileActions({
  isPending,
  isSuccess,
  isError,
  updateProfile,
  displayName,
  unchanged,
}: AccountProfileActionsProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <View style={styles.actions}>
      {isError && (
        <AppText variant="caption" style={{ color: theme.colors.state.dangerContent }}>
          {t("account.profile.displayNameSaveFailed", "Failed to save. Please try again.")}
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
          {isPending ? t("account.profile.saving", "Saving…") : t("account.profile.save", "Save")}
        </AppText>
      </Pressable>
    </View>
  );
}

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
      <SettingsSection
        title={t("account.editProfile", "Edit Profile")}
        description={t("account.profileDesc", "Manage your personal profile information.")}
      >
        <SettingsRow label={t("account.profile.displayName", "Display Name")}>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t("account.profile.displayNamePlaceholder", "Your display name")}
            placeholderTextColor={theme.colors.content.muted}
            style={styles.input}
          />
        </SettingsRow>
        <SettingsRow label={t("account.profile.email", "Email")} hideBorder>
          <TextInput
            value={profile.email}
            editable={false}
            style={[styles.input, styles.inputDisabled]}
          />
        </SettingsRow>
      </SettingsSection>

      <AccountProfileActions
        isPending={isPending}
        isSuccess={isSuccess}
        isError={isError}
        updateProfile={updateProfile}
        displayName={displayName}
        unchanged={unchanged}
      />
    </ScrollView>
  );
}

/** Renders the native account profile screen surface and coordinates its user-facing state. */
export function AccountProfileScreen(_props: AccountProfileScreenProps) {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useAccountProfile();
  const { mutate: updateProfile, isPending, isSuccess, isError } = useUpdateProfile();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <AppText variant="bodyMd">{t("account.profile.loading", "Loading profile...")}</AppText>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <AppText variant="bodyMd">
          {t("account.profile.notAvailable", "Profile not available")}
        </AppText>
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
    backgroundColor: theme.colors.surface.canvas,
  },
  content: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingVertical: theme.spacing.layout.pageY,
  },
  input: {
    fontSize: 14,
    color: theme.colors.content.default,
    textAlign: getRtlAwareTextAlign(theme.direction),
    flex: 1,
  },
  inputDisabled: {
    color: theme.colors.content.muted,
  },
  actions: {
    marginTop: theme.spacing.scale.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
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
