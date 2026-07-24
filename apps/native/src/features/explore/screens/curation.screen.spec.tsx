import { render, screen } from "@testing-library/react-native";
import { CurationScreen } from "./curation.screen";

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

describe("CurationScreen", () => {
  it("should render curation title", async () => {
    await render(<CurationScreen />);
    expect(screen.getByText("Curation")).toBeTruthy();
  });

  it("should render curation description", async () => {
    await render(<CurationScreen />);
    expect(screen.getByText("Coming soon")).toBeTruthy();
  });
});
