"use client";

import {
  setShowOriginalContent,
  useShowOriginalContent,
} from "@/features/settings/content-preference";
import { Switch as Toggle } from "@/shared/components/ui/switch";

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
