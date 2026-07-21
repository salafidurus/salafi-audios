"use client";

import {
  setShowOriginalContent,
  useShowOriginalContent,
} from "@/features/settings/content-preference";
import { Toggle } from "@/shared/components/Toggle";

export function ContentLanguageToggle() {
  const showOriginal = useShowOriginalContent();

  return (
    <Toggle
      checked={showOriginal}
      onChange={setShowOriginalContent}
      aria-label="Show content in its original language"
    />
  );
}
