type PluralRuleLocale = "ar" | "en";
type PluralRuleType = Intl.PluralRuleType;

const ARABIC_CARDINAL_CATEGORIES: Intl.LDMLPluralRule[] = [
  "zero",
  "one",
  "two",
  "few",
  "many",
  "other",
];
const ENGLISH_CARDINAL_CATEGORIES: Intl.LDMLPluralRule[] = ["one", "other"];
const ENGLISH_ORDINAL_CATEGORIES: Intl.LDMLPluralRule[] = [
  "one",
  "two",
  "few",
  "other",
];

function normalizeLocale(locales?: string | string[]): PluralRuleLocale {
  const requested = Array.isArray(locales) ? locales[0] : locales;
  if (!requested) {
    return "en";
  }

  return requested.toLowerCase().startsWith("ar") ? "ar" : "en";
}

function getPluralCategories(
  locale: PluralRuleLocale,
  type: PluralRuleType,
): Intl.LDMLPluralRule[] {
  if (locale === "ar" && type === "cardinal") {
    return ARABIC_CARDINAL_CATEGORIES;
  }

  if (type === "ordinal") {
    return ENGLISH_ORDINAL_CATEGORIES;
  }

  return ENGLISH_CARDINAL_CATEGORIES;
}

function selectEnglishCardinal(value: number): Intl.LDMLPluralRule {
  return value === 1 && Number.isInteger(value) ? "one" : "other";
}

function selectEnglishOrdinal(value: number): Intl.LDMLPluralRule {
  const mod10 = Math.abs(value) % 10;
  const mod100 = Math.abs(value) % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "one";
  }
  if (mod10 === 2 && mod100 !== 12) {
    return "two";
  }
  if (mod10 === 3 && mod100 !== 13) {
    return "few";
  }
  return "other";
}

function selectArabicCardinal(value: number): Intl.LDMLPluralRule {
  const integerValue = Math.trunc(Math.abs(value));
  const mod100 = integerValue % 100;

  if (!Number.isFinite(value)) {
    return "other";
  }
  if (integerValue === 0) {
    return "zero";
  }
  if (integerValue === 1) {
    return "one";
  }
  if (integerValue === 2) {
    return "two";
  }
  if (mod100 >= 3 && mod100 <= 10) {
    return "few";
  }
  if (mod100 >= 11 && mod100 <= 99) {
    return "many";
  }
  return "other";
}

class IntlPluralRulesPolyfill implements Intl.PluralRules {
  private readonly locale: PluralRuleLocale;
  private readonly type: PluralRuleType;

  public constructor(locales?: string | string[], options?: Intl.PluralRulesOptions) {
    this.locale = normalizeLocale(locales);
    this.type = options?.type ?? "cardinal";
  }

  public resolvedOptions(): Intl.ResolvedPluralRulesOptions {
    return {
      locale: this.locale,
      type: this.type,
      minimumIntegerDigits: 1,
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
      pluralCategories: getPluralCategories(this.locale, this.type),
    };
  }

  public select(value: number): Intl.LDMLPluralRule {
    if (this.type === "ordinal") {
      return selectEnglishOrdinal(value);
    }

    if (this.locale === "ar") {
      return selectArabicCardinal(value);
    }

    return selectEnglishCardinal(value);
  }

  public selectRange(start: number, end: number): Intl.LDMLPluralRule {
    void start;
    return this.select(end);
  }

  public static supportedLocalesOf(locales?: string | string[]): string[] {
    const values = Array.isArray(locales) ? locales : locales ? [locales] : [];

    return values.filter((value) => {
      const normalized = value.toLowerCase();
      return normalized.startsWith("ar") || normalized.startsWith("en");
    });
  }
}

export function ensureIntlPluralRules(): void {
  const globalWithIntl = globalThis as typeof globalThis & {
    Intl?: typeof Intl;
  };

  if (typeof globalWithIntl.Intl === "undefined") {
    globalWithIntl.Intl = {} as typeof Intl;
  }

  if (typeof globalWithIntl.Intl.PluralRules !== "function") {
    Object.defineProperty(globalWithIntl.Intl, "PluralRules", {
      configurable: true,
      value: IntlPluralRulesPolyfill as unknown as typeof Intl.PluralRules,
      writable: true,
    });
  }
}
