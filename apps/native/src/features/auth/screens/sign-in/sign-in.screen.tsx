import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useTranslation } from "@sd/core-i18n";
import { AccentGradientFill } from "@/shared/components/AccentGradientFill/AccentGradientFill";
import { Button } from "@/shared/components/Button/Button";
import { TextInput } from "@/shared/components/TextInput/TextInput";

type FormValues = {
  email: string;
  password: string;
};

export type SignInScreenProps = {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignInWithGoogle: () => void;
  onSignInWithApple: () => void;
  onNavigateToSignUp: () => void;
  onBack?: () => void;
  googleButtonSource?: ImageSourcePropType;
};

export function SignInScreen({
  onSignIn,
  onSignInWithGoogle,
  onSignInWithApple,
  onNavigateToSignUp,
  onBack,
  googleButtonSource,
}: SignInScreenProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  async function onSubmit({ email, password }: FormValues) {
    setLoading(true);
    setError("");
    try {
      await onSignIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.signIn.failed"));
    } finally {
      setLoading(false);
    }
  }

  const heroRecipe = theme.recipes.mixedHeroSurface;

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      bottomOffset={16}
    >
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
              resizeMode="cover"
            />
          )}
        </Pressable>

        <Text style={styles.divider}>{t("auth.signIn.orEmail")}</Text>

        <Controller
          control={control}
          name="email"
          rules={{
            required: true,
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t("validation.emailInvalid"),
            },
          }}
          render={({ field: { value, onChange, onBlur } }) => (
            <>
              <TextInput
                style={styles.input}
                invalid={Boolean(errors.email)}
                placeholder={t("common.email")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
              {errors.email?.message ? (
                <Text style={styles.fieldError}>{errors.email.message}</Text>
              ) : null}
            </>
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: true }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={styles.input}
              placeholder={t("common.password")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              textContentType="password"
            />
          )}
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <Button
            variant="primary"
            size="md"
            label={t("auth.signIn.submit")}
            fullWidth
            disabled={!isValid}
            onPress={isValid ? handleSubmit(onSubmit) : undefined}
          />
        )}

        <Pressable onPress={onNavigateToSignUp}>
          <Text style={styles.link}>{t("auth.signIn.noAccount")}</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flexGrow: 1, justifyContent: "center" },
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
  divider: {
    textAlign: "center",
    color: theme.colors.content.primary,
    fontSize: 14,
    marginVertical: theme.spacing.component.gapMd,
  },
  input: {
    marginBottom: theme.spacing.component.gapSm,
  },
  error: {
    color: theme.colors.state.danger,
    fontSize: 14,
    marginBottom: theme.spacing.component.gapSm,
  },
  loader: { marginTop: 4 },
  link: {
    textAlign: "center",
    color: theme.colors.content.primary,
    marginTop: theme.spacing.component.gapMd,
    fontSize: 14,
  },
  pressed: { opacity: 0.75 },
  fieldError: {
    color: theme.colors.state.danger,
    fontSize: 12,
    marginTop: -4,
    marginBottom: theme.spacing.component.gapSm,
  },
}));
