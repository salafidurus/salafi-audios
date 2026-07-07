import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import * as AppleAuthentication from "expo-apple-authentication";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useTranslation } from "@/core/i18n/use-translation";
import { AccentGradientFill } from "@/shared/components/AccentGradientFill/AccentGradientFill";

export type SignInScreenProps = {
  onSignInWithGoogle: () => void;
  onSignInWithApple: () => void;
  onBack?: () => void;
  appleLoading?: boolean;
};

export function SignInScreen({
  onSignInWithGoogle,
  onSignInWithApple,
  onBack,
  appleLoading,
}: SignInScreenProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

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
          <Text style={styles.kicker}>{t("auth.signIn.kicker")}</Text>
          <Text style={styles.title}>{t("auth.signIn.title")}</Text>
        </View>

        {Platform.OS === "ios" && (
          <View style={styles.appleBtnContainer}>
            {appleLoading ? (
              <View style={[styles.appleBtn, styles.appleBtnLoading]}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={8}
                style={styles.appleBtn}
                onPress={onSignInWithApple}
              />
            )}
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.googleBtn, pressed && styles.googleBtnPressed]}
          onPress={onSignInWithGoogle}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          <View style={styles.googleBtnContent}>
            <View style={styles.googleIconContainer}>
              <Svg width={20} height={20} viewBox="0 0 48 48">
                <Path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <Path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <Path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <Path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
                <Path fill="none" d="M0 0h48v48H0z" />
              </Svg>
            </View>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </View>
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
    color: theme.colors.content.primary,
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
  appleBtnContainer: { width: "100%", marginBottom: theme.spacing.component.gapSm },
  appleBtn: { width: "100%", height: 48 },
  appleBtnLoading: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 8,
  },
  googleBtn: {
    borderRadius: theme.radius.component.chip,
    overflow: "hidden",
    marginBottom: theme.spacing.component.gapSm,
    backgroundColor: theme.colors.surface.default,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  googleBtnPressed: { opacity: 0.85 },
  googleBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.sm,
    gap: theme.spacing.scale.sm,
  },
  googleBtnText: {
    color: theme.colors.content.default,
    ...theme.typography.labelMd,
    fontWeight: "500" as const,
  },
  googleIconContainer: {
    width: 20,
    height: 20,
  },
  pressed: { opacity: 0.75 },
}));
