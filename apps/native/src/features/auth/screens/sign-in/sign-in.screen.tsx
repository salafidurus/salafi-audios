import { Column, RNHostView, ScrollView } from "@expo/ui";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { NativeButton, NativeScreenHost, NativeText } from "@/shared/ui";

/** Carries provider callbacks and nullable transient loading/error state. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module/declaration comments are both present above.
export type SignInScreenProps = {
  onSignInWithGoogle: () => void;
  onSignInWithApple: () => void;
  onBack?: () => void;
  appleLoading?: boolean;
  googleLoading?: boolean;
  /** Displays the latest Apple provider failure below the actions. */
  appleError?: string | null;
  /** Displays the latest Google provider failure below the actions. */
  googleError?: string | null;
};

function getGoogleButtonLabel(
  loading: boolean | undefined,
  t: ReturnType<typeof useTranslation>["t"],
) {
  return loading
    ? t("auth.signIn.submitting", "Signing in").replace(/…$/, "")
    : t("auth.signIn.continueWithGoogle", "Continue with Google");
}

function getSignInError(googleError?: string | null, appleError?: string | null) {
  return googleError ?? appleError;
}

/** Renders the native sign-in surface and its provider actions. */
export function SignInScreen({
  onSignInWithGoogle,
  onSignInWithApple,
  onBack,
  appleLoading: _appleLoading,
  googleLoading,
  appleError,
  googleError,
}: SignInScreenProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  return (
    <NativeScreenHost testID="sign-in-host">
      <ScrollView showsIndicators={false}>
        <Column
          spacing={theme.spacing.component.gapLg}
          style={{ padding: theme.spacing.layout.pageX }}
        >
          {onBack ? (
            <NativeButton
              label={t("common.back", "Back")}
              icon="back"
              variant="ghost"
              onPress={onBack}
            />
          ) : null}
          <Column
            spacing={theme.spacing.scale.xs}
            style={{ padding: theme.spacing.component.panelPadding }}
          >
            <NativeText variant="labelMd" colorRole="primary">
              {t("auth.signIn.kicker", "Welcome Back")}
            </NativeText>
            <NativeText variant="displayMd" colorRole="strong">
              {t("auth.signIn.title", "Sign In")}
            </NativeText>
          </Column>

          {Platform.OS === "ios" && (
            <RNHostView>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={theme.radius.component.chip}
                style={{ alignSelf: "stretch", height: 48 }}
                onPress={onSignInWithApple}
              />
            </RNHostView>
          )}
          <NativeButton
            label={getGoogleButtonLabel(googleLoading, t)}
            loading={googleLoading}
            variant="surface"
            onPress={onSignInWithGoogle}
          />

          {getSignInError(googleError, appleError) ? (
            <NativeText testID="sign-in-error" variant="bodySm" colorRole="danger">
              {getSignInError(googleError, appleError) ?? ""}
            </NativeText>
          ) : null}
        </Column>
      </ScrollView>
    </NativeScreenHost>
  );
}
