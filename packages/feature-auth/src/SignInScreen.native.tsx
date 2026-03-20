import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  Image,
  type ImageSourcePropType,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as AppleAuthentication from "expo-apple-authentication";
import { StyleSheet } from "react-native-unistyles";
import { Controller, useForm } from "react-hook-form";

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
  googleLogoSource?: ImageSourcePropType;
};

export function SignInScreen({
  onSignIn,
  onSignInWithGoogle,
  onSignInWithApple,
  onNavigateToSignUp,
  onBack,
  googleLogoSource,
}: SignInScreenProps) {
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
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

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
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        ) : null}

        <Text style={styles.title}>Sign In</Text>

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
          {googleLogoSource && (
            <Image source={googleLogoSource} style={styles.googleLogo} resizeMode="contain" />
          )}
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </Pressable>

        <Text style={styles.divider}>or sign in with email</Text>

        <Controller
          control={control}
          name="email"
          rules={{
            required: true,
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address.",
            },
          }}
          render={({ field: { value, onChange, onBlur } }) => (
            <>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : undefined]}
                placeholder="Email"
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
              placeholder="Password"
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
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              !isValid && styles.btnDisabled,
              pressed && isValid && styles.pressed,
            ]}
            onPress={isValid ? handleSubmit(onSubmit) : undefined}
          >
            <Text style={styles.btnText}>Sign In</Text>
          </Pressable>
        )}

        <Pressable onPress={onNavigateToSignUp}>
          <Text style={styles.link}>Don't have an account? Create one</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flexGrow: 1, justifyContent: "center" },
  inner: { padding: theme.spacing.layout.pageX },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: theme.spacing.component.gapXs,
    marginBottom: theme.spacing.component.gapLg,
  },
  backButtonText: {
    color: theme.colors.content.primary,
    ...theme.typography.labelMd,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: theme.spacing.component.gapXl,
    color: theme.colors.content.strong,
  },
  appleBtn: { width: "100%", height: 48, marginBottom: theme.spacing.component.gapSm },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.component.gapSm,
    borderWidth: 1,
    borderColor: "#747775",
    borderRadius: 8,
    padding: 14,
    marginBottom: theme.spacing.component.gapSm,
    backgroundColor: "#FFFFFF",
  },
  googleLogo: { width: 22, height: 22 },
  googleBtnText: { fontSize: 16, fontWeight: "500", color: "#1F1F1F" },
  divider: {
    textAlign: "center",
    color: theme.colors.content.muted,
    fontSize: 14,
    marginVertical: theme.spacing.component.gapMd,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: theme.spacing.component.gapSm,
    backgroundColor: theme.colors.surface.subtle,
    color: theme.colors.content.default,
  },
  error: {
    color: theme.colors.state.danger,
    fontSize: 14,
    marginBottom: theme.spacing.component.gapSm,
  },
  loader: { marginTop: 4 },
  btn: {
    backgroundColor: theme.colors.action.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: theme.colors.content.onPrimary, fontSize: 16, fontWeight: "600" },
  link: {
    textAlign: "center",
    color: theme.colors.content.primary,
    marginTop: theme.spacing.component.gapMd,
    fontSize: 14,
  },
  pressed: { opacity: 0.75 },
  inputError: { borderColor: theme.colors.state.danger },
  fieldError: {
    color: theme.colors.state.danger,
    fontSize: 12,
    marginTop: -4,
    marginBottom: theme.spacing.component.gapSm,
  },
  btnDisabled: { opacity: 0.45 },
}));
