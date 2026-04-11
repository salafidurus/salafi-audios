import { createLanguageStore, type LanguageStorageAdapter } from "../language-store";

function makeAdapter(
  initial: string | null = null,
): LanguageStorageAdapter & { store: Map<string, string> } {
  const store = new Map<string, string>();
  if (initial !== null) store.set("sd_locale", initial);
  return {
    store,
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe("createLanguageStore", () => {
  it("returns DEFAULT_LOCALE when storage is empty", async () => {
    const adapter = makeAdapter(null);
    const ls = createLanguageStore(adapter);
    expect(await ls.getLanguage()).toBe("en");
  });

  it("returns the persisted locale", async () => {
    const adapter = makeAdapter("ar");
    const ls = createLanguageStore(adapter);
    expect(await ls.getLanguage()).toBe("ar");
  });

  it("falls back to DEFAULT_LOCALE for unknown locale strings", async () => {
    const adapter = makeAdapter("fr");
    const ls = createLanguageStore(adapter);
    expect(await ls.getLanguage()).toBe("en");
  });

  it("persists a locale via setLanguage", async () => {
    const adapter = makeAdapter(null);
    const ls = createLanguageStore(adapter);
    await ls.setLanguage("ar");
    expect(adapter.store.get("sd_locale")).toBe("ar");
  });

  it("setLanguage then getLanguage round-trips correctly", async () => {
    const adapter = makeAdapter(null);
    const ls = createLanguageStore(adapter);
    await ls.setLanguage("ar");
    expect(await ls.getLanguage()).toBe("ar");
  });

  it("accepts an async adapter (Promise-returning getItem/setItem)", async () => {
    const store = new Map<string, string>();
    const adapter: LanguageStorageAdapter = {
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        store.set(key, value);
      },
    };
    const ls = createLanguageStore(adapter);
    await ls.setLanguage("ar");
    expect(await ls.getLanguage()).toBe("ar");
  });
});
