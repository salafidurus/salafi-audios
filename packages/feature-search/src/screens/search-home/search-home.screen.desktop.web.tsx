"use client";

import { useRouter } from "next/navigation";
import { SearchHomeDesktopWebView } from "../../components/SearchHomeDesktopView/SearchHomeDesktopView.desktop.web";

export function SearchHomeDesktopWebScreen() {
  const router = useRouter();

  return <SearchHomeDesktopWebView onOpenSearch={() => router.push("/search")} />;
}
