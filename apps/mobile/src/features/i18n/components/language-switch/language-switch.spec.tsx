import { fireEvent, render, screen } from "@testing-library/react-native";
import { LanguageSwitch } from "./language-switch";
import { changeLocale } from "../../../../core/i18n/i18n";

const mockUseTranslation = jest.fn(() => ({
  i18n: { language: "en" },
}));

jest.mock("@sd/core-i18n", () => ({
  SUPPORTED_LOCALES: ["en", "ar"],
}));

jest.mock("../../../../core/i18n/use-translation", () => ({
  useTranslation: () => mockUseTranslation(),
}));

jest.mock("../../../../core/i18n/i18n", () => ({
  changeLocale: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (styles: (theme: unknown) => unknown) =>
      styles({
        spacing: {
          component: { gapSm: 8 },
          scale: { sm: 8, md: 12 },
        },
        radius: {
          component: { chip: 9999 },
        },
        colors: {
          border: { default: "#e5e5e5" },
          surface: { default: "#ffffff" },
          action: { primary: "#14b8a6" },
          content: { strong: "#111111", onPrimary: "#0d0d0d" },
        },
        typography: {
          labelMd: {},
        },
      }),
  },
}));

describe("LanguageSwitch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      i18n: { language: "en" },
    });
  });

  it("renders all supported locales", () => {
    render(<LanguageSwitch />);

    expect(screen.getByText("English")).toBeTruthy();
    expect(screen.getByText("العربية")).toBeTruthy();
  });

  it("changes locale when a locale button is pressed", () => {
    render(<LanguageSwitch />);

    fireEvent.press(screen.getByText("العربية"));

    expect(changeLocale).toHaveBeenCalledWith("ar");
  });
});
