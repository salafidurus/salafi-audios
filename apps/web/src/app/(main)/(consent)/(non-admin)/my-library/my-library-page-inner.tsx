/** Documents this module's responsibility and public boundary. */
"use client";

import { useSearchParams } from "next/navigation";

import { MyLibraryCompletedScreen } from "@/features/my-library/screens/my-library-completed.screen";
import { MyLibrarySavedScreen } from "@/features/my-library/screens/my-library-saved.screen";
import { MyLibraryScreen } from "@/features/my-library/screens/my-library.screen";

const MY_LIBRARY_TABS = ["started", "saved", "completed"] as const;
type MyLibraryTab = (typeof MY_LIBRARY_TABS)[number];

function isMyLibraryTab(value: string | null): value is MyLibraryTab {
  // SAFETY: membership is checked against the complete literal tab tuple.
  return value !== null && MY_LIBRARY_TABS.includes(value as MyLibraryTab);
}

/** Selects the canonical library screen from the validated `tab` query value. */
export default function MyLibraryPageInner() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  if (tab === "saved") return <MyLibrarySavedScreen />;
  if (tab === "completed") return <MyLibraryCompletedScreen />;
  if (isMyLibraryTab(tab) || tab === null) return <MyLibraryScreen />;

  return <MyLibraryScreen />;
}
