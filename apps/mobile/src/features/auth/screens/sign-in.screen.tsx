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
import { useRouter } from "expo-router";
import { authClient } from "@/core/auth/auth-client";

export function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailSignIn() {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    const { error: err } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Sign in failed");
      return;
    }
    router.replace("/");
  }

  async function handleAppleSignIn() {
    await authClient.signIn.social({ provider: "apple" });
  }

  async function handleGoogleSignIn() {
    await authClient.signIn.social({ provider: "google" });
  }

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.inner}>
        <Text style={s.title}>Sign In</Text>

        {Platform.OS === "ios" && (
          <TouchableOpacity style={s.socialBtn} onPress={handleAppleSignIn}>
            <Text style={s.socialBtnText}>Continue with Apple</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.socialBtn} onPress={handleGoogleSignIn}>
          <Text style={s.socialBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={s.divider}>or sign in with email</Text>

        <TextInput
          style={s.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextInput
          style={s.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />

        {!!error && <Text style={s.error}>{error}</Text>}

        {loading ? (
          <ActivityIndicator style={s.loader} />
        ) : (
          <TouchableOpacity style={s.btn} onPress={handleEmailSignIn}>
            <Text style={s.btnText}>Sign In</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.push("/sign-up")}>
          <Text style={s.link}>Don&apos;t have an account? Create one</Text>
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
