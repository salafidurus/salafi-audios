import { Stack } from "expo-router";
import * as Idx from "./index";
import * as Srch from "./search";
import * as Sch from "./scholars";
import * as Col from "./collection/[id]";
import * as Lec from "./lecture/[id]";
import * as ScDet from "./scholar/[slug]";
import * as Ser from "./series/[id]";

// eslint-disable-next-line no-console
console.log("[PROBE (search) routes] defaults:", {
  index: typeof Idx.default,
  search: typeof Srch.default,
  scholars: typeof Sch.default,
  "collection/[id]": typeof Col.default,
  "lecture/[id]": typeof Lec.default,
  "scholar/[slug]": typeof ScDet.default,
  "series/[id]": typeof Ser.default,
});

export default function SearchLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
    </Stack>
  );
}
