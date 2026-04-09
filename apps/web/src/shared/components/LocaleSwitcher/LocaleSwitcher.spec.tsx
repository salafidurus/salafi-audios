import { render, screen, fireEvent } from "@testing-library/react";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { setLocaleCookie } from "../../../core/i18n/locale-cookie";

const mockChangeLanguage = jest.fn().mockResolvedValue(undefined);
const mockRefresh = jest.fn();

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { language: "en", changeLanguage: mockChangeLanguage },
  }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

jest.mock("../../../core/i18n/locale-cookie", () => ({
  setLocaleCookie: jest.fn(),
}));

describe("LocaleSwitcher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the current locale label", () => {
    render(<LocaleSwitcher />);
    expect(screen.getByRole("button")).toBeInTheDocument();
    // When current language is "en", button shows the other locale option
    expect(screen.getByRole("button")).toHaveTextContent("العربية");
  });

  it("switches to Arabic when current locale is English", async () => {
    const { rerender } = render(<LocaleSwitcher />);
    fireEvent.click(screen.getByRole("button"));

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockChangeLanguage).toHaveBeenCalledWith("ar");
    expect(setLocaleCookie).toHaveBeenCalledWith("ar");
    expect(mockRefresh).toHaveBeenCalled();
  });
});
