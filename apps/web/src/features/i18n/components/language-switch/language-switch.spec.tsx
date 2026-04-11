import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageSwitch } from "./language-switch";
import { setLocaleCookie } from "@/core/i18n/locale-cookie";

const mockChangeLanguage = jest.fn().mockResolvedValue(undefined);
const mockRefresh = jest.fn();

jest.mock("@sd/core-i18n", () => ({
  SUPPORTED_LOCALES: ["en", "ar"],
  useTranslation: () => ({
    i18n: { language: "en", changeLanguage: mockChangeLanguage },
  }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

jest.mock("../../../../core/i18n/locale-cookie", () => ({
  setLocaleCookie: jest.fn(),
}));

describe("LanguageSwitch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a button for each supported locale", () => {
    render(<LanguageSwitch />);

    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "العربية" })).toBeInTheDocument();
  });

  it("switches locale, persists it, and refreshes the router", async () => {
    render(<LanguageSwitch />);

    fireEvent.click(screen.getByRole("button", { name: "العربية" }));

    await screen.findByRole("button", { name: "العربية" });

    expect(mockChangeLanguage).toHaveBeenCalledWith("ar");
    expect(setLocaleCookie).toHaveBeenCalledWith("ar");
    expect(mockRefresh).toHaveBeenCalled();
  });
});
