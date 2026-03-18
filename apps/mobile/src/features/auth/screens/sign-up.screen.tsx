import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { authClient } from "@/core/auth/auth-client";

export function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name || !email || !password) return;
    setLoading(true);
    setError("");
    const { error: err } = await authClient.signUp.email({ name, email, password });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Sign up failed");
      return;
    }
    router.replace("/");
  }

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.inner}>
        <Text style={s.title}>Create Account</Text>

        <TextInput
          style={s.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          textContentType="name"
        />
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
          textContentType="newPassword"
        />

        {!!error && <Text style={s.error}>{error}</Text>}

        {loading ? (
          <ActivityIndicator style={s.loader} />
        ) : (
          <TouchableOpacity style={s.btn} onPress={handleSubmit}>
            <Text style={s.btnText}>Create Account</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.push("/sign-in")}>
          <Text style={s.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center" },
  inner: { padding: 24 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24 },
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
