import { useEffect, useState } from "react";

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
