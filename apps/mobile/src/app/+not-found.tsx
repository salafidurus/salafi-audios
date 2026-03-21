import { Href, Stack, useRouter } from "expo-router";
import { NotFoundStateMobileNative } from "@sd/shared";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <NotFoundStateMobileNative onPress={() => router.replace("/" as Href)} />
    </>
  );
}
