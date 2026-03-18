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
  name: string;
  email: string;
  password: string;
};

export type SignUpScreenProps = {
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  onSignUpWithGoogle: () => void;
  onSignUpWithApple: () => void;
  onNavigateToSignIn: () => void;
  googleLogoSource?: ImageSourcePropType;
};

export function SignUpScreen({
  onSignUp,
  onSignUpWithGoogle,
  onSignUpWithApple,
  onNavigateToSignIn,
  googleLogoSource,
}: SignUpScreenProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: { name: "", email: "", password: "" },
    mode: "onChange",
  });

  async function onSubmit({ name, email, password }: FormValues) {
    setLoading(true);
    setError("");
    try {
      await onSignUp(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  const { styles: s } = useStyles();

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
      bottomOffset={16}
    >
      <View style={s.inner}>
        <Text style={s.title}>Create Account</Text>

        <Pressable style={s.termsRow} onPress={() => setTermsAccepted((v) => !v)}>
          <View style={[s.checkbox, termsAccepted && s.checkboxChecked]}>
            {termsAccepted && <Text style={s.checkmark}>✓</Text>}
          </View>
          <Text style={s.termsText}>
            I agree to the <Text style={s.termsLink}>Terms of Service</Text> and{" "}
            <Text style={s.termsLink}>Privacy Policy</Text>
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
            style={[s.appleBtn, !termsAccepted && s.btnDisabled]}
            onPress={termsAccepted ? onSignUpWithApple : undefined}
          />
        )}

        <Pressable
          style={({ pressed }) => [
            s.googleBtn,
            !termsAccepted && s.btnDisabled,
            pressed && termsAccepted && s.pressed,
          ]}
          onPress={termsAccepted ? onSignUpWithGoogle : undefined}
        >
          {googleLogoSource && (
            <Image source={googleLogoSource} style={s.googleLogo} resizeMode="contain" />
          )}
          <Text style={s.googleBtnText}>Continue with Google</Text>
        </Pressable>

        <Text style={s.divider}>or sign up with email</Text>

        <Controller
          control={control}
          name="name"
          rules={{ required: true }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={s.input}
              placeholder="Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              textContentType="name"
            />
          )}
        />

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
                style={[s.input, errors.email ? s.inputError : undefined]}
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
              {errors.email?.message ? (
                <Text style={s.fieldError}>{errors.email.message}</Text>
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
              style={s.input}
              placeholder="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              textContentType="newPassword"
            />
          )}
        />

        {!!error && <Text style={s.error}>{error}</Text>}

        {loading ? (
          <ActivityIndicator style={s.loader} />
        ) : (
          <Pressable
            style={({ pressed }) => [
              s.btn,
              (!termsAccepted || !isValid) && s.btnDisabled,
              pressed && termsAccepted && isValid && s.pressed,
            ]}
            onPress={termsAccepted && isValid ? handleSubmit(onSubmit) : undefined}
          >
            <Text style={s.btnText}>Create Account</Text>
          </Pressable>
        )}

        <Pressable onPress={onNavigateToSignIn}>
          <Text style={s.link}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}

const useStyles = StyleSheet.createMemoized((theme) => ({
  container: { flexGrow: 1, justifyContent: "center" },
  inner: { padding: theme.spacing.layout.pageX },
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
    backgroundColor: theme.colors.action.primary,
    borderColor: theme.colors.action.primary,
  },
  checkmark: {
    color: theme.colors.content.onPrimary,
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
  inputError: { borderColor: theme.colors.state.danger },
  fieldError: {
    color: theme.colors.state.danger,
    fontSize: 12,
    marginTop: -4,
    marginBottom: theme.spacing.component.gapSm,
  },
}));
