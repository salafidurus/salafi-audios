import { useState } from "react";
import { Platform, Pressable, Text, View, type ImageSourcePropType } from "react-native";
import { Image } from "expo-image";
import * as AppleAuthentication from "expo-apple-authentication";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useTranslation } from "@/core/i18n/use-translation";
import { AccentGradientFill } from "@/shared/components/AccentGradientFill/AccentGradientFill";

export type SignUpScreenProps = {
  onSignUpWithGoogle: () => void;
  onSignUpWithApple: () => void;
  onNavigateToSignIn: () => void;
  onBack?: () => void;
  googleButtonSource?: ImageSourcePropType;
};

export function SignUpScreen({
  onSignUpWithGoogle,
  onSignUpWithApple,
  onNavigateToSignIn,
  onBack,
  googleButtonSource,
}: SignUpScreenProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const heroRecipe = theme.recipes.mixedHeroSurface;

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {onBack ? (
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>{t("common.back")}</Text>
          </Pressable>
        ) : null}

        <View style={styles.heroPanel}>
          <AccentGradientFill
            borderRadius={theme.radius.component.panel}
            linearColors={heroRecipe.linear.colors}
            linearStart={heroRecipe.linear.start}
            linearEnd={heroRecipe.linear.end}
            radialCenter={heroRecipe.radial.center}
            radialRadius={heroRecipe.radial.radius}
            radialCenterColor={heroRecipe.radial.centerColor}
            radialEdgeColor={heroRecipe.radial.edgeColor}
          />
          <Text style={styles.kicker}>{t("auth.signUp.kicker")}</Text>
          <Text style={styles.title}>{t("auth.signUp.title")}</Text>
        </View>

        <Pressable style={styles.termsRow} onPress={() => setTermsAccepted((value) => !value)}>
          <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            {t("auth.signUp.iAgreeTo")}{" "}
            <Text style={styles.termsLink}>{t("common.termsOfService")}</Text> {t("common.and")}{" "}
            <Text style={styles.termsLink}>{t("common.privacyPolicy")}</Text>
          </Text>
        </Pressable>

        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={
              termsAccepted
                ? AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                : AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE
            }
            cornerRadius={8}
            style={[styles.appleBtn, !termsAccepted && styles.btnDisabled]}
            onPress={() => {
              if (termsAccepted) onSignUpWithApple();
            }}
          />
        )}

        <Pressable
          style={({ pressed }) => [
            styles.googleBtn,
            !termsAccepted && styles.btnDisabled,
            pressed && termsAccepted && styles.pressed,
          ]}
          onPress={termsAccepted ? onSignUpWithGoogle : undefined}
        >
          {googleButtonSource && (
            <Image
              source={googleButtonSource}
              style={styles.googleButtonImage}
              contentFit="cover"
            />
          )}
        </Pressable>

        <Pressable onPress={onNavigateToSignIn}>
          <Text style={styles.link}>{t("auth.signUp.alreadyAccount")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, justifyContent: "center" },
  inner: { padding: theme.spacing.layout.pageX },
  heroPanel: {
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.recipes.mixedHeroSurface.borderColor,
    borderRadius: theme.radius.component.panel,
    backgroundColor: theme.recipes.mixedHeroSurface.backgroundColor,
    padding: theme.spacing.component.panelPadding,
    marginBottom: theme.spacing.component.gapXl,
    ...theme.shadows.sm,
  },
  kicker: {
    color: theme.colors.content.secondaryStrong,
    marginBottom: theme.spacing.scale.xs,
    ...theme.typography.labelMd,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: theme.spacing.scale.xs,
    marginBottom: theme.spacing.component.gapLg,
  },
  backButtonText: {
    color: theme.colors.content.primary,
    ...theme.typography.labelMd,
  },
  title: {
    color: theme.colors.content.strong,
    ...theme.typography.displayMd,
  },
  appleBtn: { width: "100%", height: 48, marginBottom: theme.spacing.component.gapSm },
  googleBtn: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: theme.spacing.component.gapSm,
    backgroundColor: "transparent",
    minHeight: 48,
  },
  googleButtonImage: { width: "100%", height: 48 },
  link: {
    textAlign: "center",
    color: theme.colors.content.primary,
    marginTop: theme.spacing.component.gapMd,
    fontSize: 14,
  },
  pressed: { opacity: 0.75 },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.component.gapSm,
    marginBottom: theme.spacing.component.gapMd,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: theme.recipes.primaryCta.backgroundColor,
    borderColor: theme.recipes.primaryCta.borderColor,
  },
  checkmark: {
    color: theme.recipes.primaryCta.textColor,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.content.muted,
    lineHeight: 18,
  },
  termsLink: {
    color: theme.colors.content.primary,
  },
  btnDisabled: {
    opacity: 0.45,
  },
}));
