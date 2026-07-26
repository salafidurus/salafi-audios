import { describe, expect, it } from "bun:test";

// Register happy-dom globals before @testing-library/react is used below —
// this package has no app-level test harness (unlike apps/web), so the
// couple of hook tests here set it up inline.
const { GlobalRegistrator } = require("@happy-dom/global-registrator");
GlobalRegistrator.register();

import { createElement, type ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import i18next from "i18next";
import { initReactI18next, I18nextProvider } from "react-i18next";
import {
  formatScholarName,
  useFormatScholarName,
  useFormattedScholarName,
} from "./format-scholar-name";

const englishT = (key: string) =>
  ({
    "scholar.title.allamah": "Shaykh Allamah",
    "scholar.title.sheikh": "Sheikh",
    "scholar.title.ustadh": "Ustadh",
    "scholar.title.akh": "Akh",
  })[key] ?? key;

const arabicT = (key: string) =>
  ({
    "scholar.title.allamah": "الشيخ العلامة",
    "scholar.title.sheikh": "الشيخ",
    "scholar.title.ustadh": "الأستاذ",
    "scholar.title.akh": "الأخ",
  })[key] ?? key;

describe("formatScholarName", () => {
  it("formats scholar name with 'sheikh' title object", () => {
    expect(
      formatScholarName({ name: "Salih al-Fawzan", title: "sheikh" }, undefined, englishT),
    ).toBe("Sheikh Salih al-Fawzan");
  });

  it("formats scholar name with 'allamah' title object", () => {
    expect(
      formatScholarName(
        { name: "Muhammad Nasiruddin al-Albani", title: "allamah" },
        undefined,
        englishT,
      ),
    ).toBe("Shaykh Allamah Muhammad Nasiruddin al-Albani");
  });

  it("formats scholar name with 'ustadh' title object", () => {
    expect(formatScholarName({ name: "Zayd bin Ali", title: "ustadh" }, undefined, englishT)).toBe(
      "Ustadh Zayd bin Ali",
    );
  });

  it("formats scholar name with 'akh' title object", () => {
    expect(
      formatScholarName({ name: "Tariq bin Abdallah", title: "akh" }, undefined, englishT),
    ).toBe("Akh Tariq bin Abdallah");
  });

  it("returns plain name when title is missing or null", () => {
    expect(
      formatScholarName({ name: "Salih al-Fawzan", title: undefined }, undefined, englishT),
    ).toBe("Salih al-Fawzan");
    expect(formatScholarName({ name: "Salih al-Fawzan", title: null }, undefined, englishT)).toBe(
      "Salih al-Fawzan",
    );
  });

  it("formats string name with title parameter", () => {
    expect(formatScholarName("Salih al-Fawzan", "sheikh", englishT)).toBe("Sheikh Salih al-Fawzan");
  });

  it("prevents double-prefixing if name already starts with title display", () => {
    expect(formatScholarName("Sheikh Salih al-Fawzan", "sheikh", englishT)).toBe(
      "Sheikh Salih al-Fawzan",
    );
    expect(
      formatScholarName("Shaykh Allamah Muhammad Nasiruddin al-Albani", "allamah", englishT),
    ).toBe("Shaykh Allamah Muhammad Nasiruddin al-Albani");
  });

  it("handles null or undefined input gracefully", () => {
    expect(formatScholarName(null, undefined, englishT)).toBe("");
    expect(formatScholarName(undefined, undefined, englishT)).toBe("");
  });

  it("uses the injected t function's translated honorific rather than a hardcoded string — proves locale is threaded through", () => {
    expect(formatScholarName("صالح الفوزان", "sheikh", arabicT)).toBe("الشيخ صالح الفوزان");
    expect(formatScholarName({ name: "محمد الأمين", title: "allamah" }, undefined, arabicT)).toBe(
      "الشيخ العلامة محمد الأمين",
    );
  });
});

function makeWrapper(locale: "en" | "ar") {
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: "en",
    resources: {
      en: { translation: { scholar: { title: { sheikh: "Sheikh", allamah: "Shaykh Allamah" } } } },
      ar: { translation: { scholar: { title: { sheikh: "الشيخ", allamah: "الشيخ العلامة" } } } },
    },
    interpolation: { escapeValue: false },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(I18nextProvider, { i18n: instance }, children);
  };
}

describe("useFormattedScholarName — resolves the honorific via useTranslation(), no manual t needed", () => {
  it("renders the English honorific when the app locale is en", () => {
    const { result } = renderHook(() => useFormattedScholarName("Salih al-Fawzan", "sheikh"), {
      wrapper: makeWrapper("en"),
    });
    expect(result.current).toBe("Sheikh Salih al-Fawzan");
  });

  it("renders the Arabic honorific when the app locale is ar — proves it's locale-driven, not hardcoded", () => {
    const { result } = renderHook(() => useFormattedScholarName("صالح الفوزان", "sheikh"), {
      wrapper: makeWrapper("ar"),
    });
    expect(result.current).toBe("الشيخ صالح الفوزان");
  });
});

describe("useFormatScholarName — returns a formatter bound to the current locale", () => {
  it("the returned formatter uses the active locale's honorific", () => {
    const { result } = renderHook(() => useFormatScholarName(), { wrapper: makeWrapper("ar") });
    expect(result.current({ name: "محمد الأمين", title: "allamah" })).toBe(
      "الشيخ العلامة محمد الأمين",
    );
  });
});
