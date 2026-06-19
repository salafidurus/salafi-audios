import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LanguageSwitch } from "./language-switch";
import { setLocaleCookie } from "@/core/i18n/locale-cookie";

const mockChangeLanguage = jest.fn().mockResolvedValue(undefined);
const mockRefresh = jest.fn();
const mockInvalidate = jest.fn().mockResolvedValue(undefined);

jest.mock("@sd/core-i18n", () => ({
  SUPPORTED_LOCALES: ["en", "ar"],
}));

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    i18n: { language: "en", changeLanguage: mockChangeLanguage },
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidate }),
}));

jest.mock("../../../../core/i18n/locale-cookie", () => ({
  setLocaleCookie: jest.fn(),
}));

describe("LanguageSwitch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the active locale and opens a menu of locales on click", () => {
    render(<LanguageSwitch />);

    // Trigger shows the current language.
    const trigger = screen.getByRole("button", { name: "Language" });
    expect(trigger).toHaveTextContent("English");

    // Menu is closed initially.
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "العربية" })).toBeInTheDocument();
  });

  it("switches locale, persists it, invalidates queries, and refreshes", async () => {
    render(<LanguageSwitch />);

    fireEvent.click(screen.getByRole("button", { name: "Language" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "العربية" }));

    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());

    expect(mockChangeLanguage).toHaveBeenCalledWith("ar");
    expect(setLocaleCookie).toHaveBeenCalledWith("ar");
    expect(mockInvalidate).toHaveBeenCalled();
  });
});
