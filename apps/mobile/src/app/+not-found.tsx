import { Href, Stack, useRouter } from "expo-router";
import { NotFoundStateMobileNative } from "../shared/components/NotFoundState/NotFoundState";
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
