import { Href, Stack, useRouter } from "expo-router";
import { NotFoundStateMobileNative } from "@sd/shared";
import { routes } from "@sd/core-contracts";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <NotFoundStateMobileNative onPress={() => router.replace(routes.home as Href)} />
    </>
  );
}
