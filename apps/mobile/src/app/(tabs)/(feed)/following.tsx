import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@sd/core-auth";
import { ScreenInProgress } from "@sd/shared";

export default function FeedFollowing() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <View style={s.container}>
        <Text style={s.heading}>Sign in to see content from scholars you follow</Text>
        <Text style={s.sub}>
          Follow your favourite scholars to get personalised content in your feed.
        </Text>
        <TouchableOpacity style={s.btn} onPress={() => router.push("/sign-in")}>
          <Text style={s.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <ScreenInProgress />;
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  heading: { fontSize: 18, fontWeight: "600", textAlign: "center", marginBottom: 8 },
  sub: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 24 },
  btn: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
