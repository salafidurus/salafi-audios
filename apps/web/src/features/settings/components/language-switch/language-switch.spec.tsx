import { vi } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LanguageSwitch } from "./language-switch";
import { setLocaleCookie } from "@/core/i18n/locale-cookie";

const mockChangeLanguage = vi.fn().mockResolvedValue(undefined);
const mockRefresh = vi.fn();
const mockInvalidate = vi.fn().mockResolvedValue(undefined);

vi.mock("@sd/core-i18n", () => ({
  SUPPORTED_LOCALES: ["en", "ar"],
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    i18n: { language: "en", changeLanguage: mockChangeLanguage },
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidate }),
}));

vi.mock("../../../../core/i18n/locale-cookie", () => ({
  setLocaleCookie: vi.fn(),
}));

describe("LanguageSwitch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the active locale and opens a listbox of locales on click", () => {
    render(<LanguageSwitch />);

    const trigger = screen.getByRole("combobox", { name: "Language" });
    expect(trigger).toHaveTextContent("English");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "العربية" })).toBeInTheDocument();
  });

  it("applies contentUp class when direction is up", () => {
    render(<LanguageSwitch direction="up" />);

    fireEvent.click(screen.getByRole("combobox", { name: "Language" }));

    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("contentUp");
  });

  it("switches locale, persists it, invalidates queries, and refreshes", async () => {
    render(<LanguageSwitch />);

    fireEvent.click(screen.getByRole("combobox", { name: "Language" }));
    fireEvent.click(screen.getByRole("option", { name: "العربية" }));

    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());

    expect(mockChangeLanguage).toHaveBeenCalledWith("ar");
    expect(setLocaleCookie).toHaveBeenCalledWith("ar");
    expect(mockInvalidate).toHaveBeenCalled();
  });
});
