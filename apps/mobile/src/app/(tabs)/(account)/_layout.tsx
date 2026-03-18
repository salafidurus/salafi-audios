import { useEffect } from "react";
import { Slot, useRouter } from "expo-router";
import { useAuth } from "@/core/auth/use-auth";
import { ActivityIndicator, View } from "react-native";

export default function AccountLayout() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/sign-in");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Slot />;
}
