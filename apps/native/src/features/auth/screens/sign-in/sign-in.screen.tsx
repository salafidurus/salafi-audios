import { Platform, Pressable, Text, View, type ImageSourcePropType } from "react-native";
import { Image } from "expo-image";
import * as AppleAuthentication from "expo-apple-authentication";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useTranslation } from "@/core/i18n/use-translation";
import { AccentGradientFill } from "@/shared/components/AccentGradientFill/AccentGradientFill";

export type SignInScreenProps = {
  onSignInWithGoogle: () => void;
  onSignInWithApple: () => void;
  onBack?: () => void;
  googleButtonSource?: ImageSourcePropType;
};

export function SignInScreen({
  onSignInWithGoogle,
  onSignInWithApple,
  onBack,
  googleButtonSource,
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
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={8}
            style={styles.appleBtn}
            onPress={onSignInWithApple}
          />
        )}

        <Pressable
          style={({ pressed }) => [styles.googleBtn, pressed && styles.pressed]}
          onPress={onSignInWithGoogle}
        >
          {googleButtonSource && (
            <Image
              source={googleButtonSource}
              style={styles.googleButtonImage}
              contentFit="cover"
            />
          )}
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
  appleBtn: { width: "100%", height: 48, marginBottom: theme.spacing.component.gapSm },
  googleBtn: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: theme.spacing.component.gapSm,
    backgroundColor: "transparent",
    minHeight: 48,
  },
  googleButtonImage: { width: "100%", height: 48 },
  pressed: { opacity: 0.75 },
}));
