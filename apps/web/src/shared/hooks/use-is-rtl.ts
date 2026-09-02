import { useEffect, useState } from "react";

/** Provides document-direction state for components that need RTL-aware behavior. */
/**
 * Tracks whether the document currently uses right-to-left layout.
 *
 * The hook treats an explicit `dir="rtl"` or an Arabic document language as
 * right-to-left, updates when the root element's `dir` or `lang` attributes
 * change, and disconnects its observer when the component unmounts.
 */
export function useIsRtl(): boolean {
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    const updateLanguage = () => {
      const htmlDir = document.documentElement.dir;
      const htmlLang = document.documentElement.lang;
      setIsRtl(htmlDir === "rtl" || htmlLang?.startsWith("ar"));
    };

    updateLanguage();

    const observer = new MutationObserver(updateLanguage);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir", "lang"],
    });

    return () => observer.disconnect();
  }, []);

  return isRtl;
}
