/** Native account-profile editing surface backed by account domain hooks. */
import { Column, Row, ScrollView } from "@expo/ui";
import { useAccountProfile, useUpdateProfile } from "@sd/domain-account";
import { useState } from "react";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { NativeButton, NativeScreenHost, NativeText, TextInput } from "@/shared/ui";

import { SettingsRow } from "../components/SettingsRow/SettingsRow";
import { SettingsSection } from "../components/SettingsSection/SettingsSection";

/** Carries the optional back action supplied by the Expo Router parent route. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module/declaration comments are both present above.
export type AccountProfileScreenProps = {
  onBack?: () => void;
};

type AccountProfileFormProps = {
  profile: NonNullable<ReturnType<typeof useAccountProfile>["data"]>;
  isPending: boolean;
  isSuccess: boolean;
  /** Indicates that the last profile mutation failed and feedback is required. */
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
    <NativeScreenHost testID="account-profile-form-host">
      <ScrollView showsIndicators={false}>
        <Column
          spacing={theme.spacing.scale.lg}
          style={{
            paddingHorizontal: theme.spacing.layout.pageX,
            paddingVertical: theme.spacing.layout.pageY,
          }}
        >
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
              />
            </SettingsRow>
            <SettingsRow label={t("account.profile.email", "Email")} hideBorder>
              <TextInput value={profile.email} editable={false} />
            </SettingsRow>
          </SettingsSection>

          <Row alignment="center" spacing={theme.spacing.scale.md}>
            {isError ? (
              <NativeText variant="caption" colorRole="danger">
                {t("account.profile.displayNameSaveFailed", "Failed to save. Please try again.")}
              </NativeText>
            ) : null}
            {isSuccess ? (
              <NativeText variant="caption" colorRole="success">
                {t("account.saved", "Saved.")}
              </NativeText>
            ) : null}
            <NativeButton
              label={
                isPending
                  ? t("account.profile.saving", "Saving…")
                  : t("account.profile.save", "Save")
              }
              variant="primary"
              size="md"
              disabled={isPending || unchanged}
              onPress={() => updateProfile({ displayName })}
            />
          </Row>
        </Column>
      </ScrollView>
    </NativeScreenHost>
  );
}

/** Loads the account profile and delegates editing to the native form surface. */
export function AccountProfileScreen(_props: AccountProfileScreenProps) {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useAccountProfile();
  const { mutate: updateProfile, isPending, isSuccess, isError } = useUpdateProfile();

  if (isLoading) {
    return (
      <NativeScreenHost style={{ justifyContent: "center", alignItems: "center" }}>
        <NativeText variant="bodyMd">
          {t("account.profile.loading", "Loading profile...")}
        </NativeText>
      </NativeScreenHost>
    );
  }

  if (!profile) {
    return (
      <NativeScreenHost style={{ justifyContent: "center", alignItems: "center" }}>
        <NativeText variant="bodyMd">
          {t("account.profile.notAvailable", "Profile not available")}
        </NativeText>
      </NativeScreenHost>
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
