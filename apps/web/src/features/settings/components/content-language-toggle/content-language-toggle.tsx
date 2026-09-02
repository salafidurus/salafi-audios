/** Documents this module's responsibility and public boundary. */
"use client";

import {
  setShowOriginalContent,
  useShowOriginalContent,
} from "@/features/settings/content-preference";
import { Switch as Toggle } from "@/shared/components/ui/switch";

/** Documents the intent and contract of this declaration. */
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
