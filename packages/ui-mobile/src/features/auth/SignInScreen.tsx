import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
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
};

export function SignInScreen({
  onSignIn,
  onSignInWithGoogle,
  onSignInWithApple,
  onNavigateToSignUp,
}: SignInScreenProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { email: "", password: "" },
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
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.inner}>
        <Text style={s.title}>Sign In</Text>

        {Platform.OS === "ios" && (
          <TouchableOpacity style={s.socialBtn} onPress={onSignInWithApple}>
            <Text style={s.socialBtnText}>Continue with Apple</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.socialBtn} onPress={onSignInWithGoogle}>
          <Text style={s.socialBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={s.divider}>or sign in with email</Text>

        <Controller
          control={control}
          name="email"
          rules={{ required: true }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={s.input}
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
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
              textContentType="password"
            />
          )}
        />

        {!!error && <Text style={s.error}>{error}</Text>}

        {loading ? (
          <ActivityIndicator style={s.loader} />
        ) : (
          <TouchableOpacity style={s.btn} onPress={handleSubmit(onSubmit)}>
            <Text style={s.btnText}>Sign In</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onNavigateToSignUp}>
          <Text style={s.link}>Don't have an account? Create one</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center" },
  inner: { padding: 24 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24 },
  socialBtn: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  socialBtnText: { fontSize: 16, fontWeight: "500" },
  divider: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
    marginVertical: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  error: { color: "#dc2626", fontSize: 14, marginBottom: 8 },
  loader: { marginTop: 4 },
  btn: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { textAlign: "center", color: "#2563eb", marginTop: 16, fontSize: 14 },
});
