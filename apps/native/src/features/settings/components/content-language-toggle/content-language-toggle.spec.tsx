import { render, screen, fireEvent } from "@testing-library/react-native";

import { ContentLanguageToggle } from "./content-language-toggle";

const mockUseShowOriginalContent = jest.fn(() => false);
const mockSetShowOriginalContent = jest.fn();

jest.mock("@/features/settings/content-preference", () => ({
  useShowOriginalContent: () => mockUseShowOriginalContent(),
  setShowOriginalContent: (value: boolean) => mockSetShowOriginalContent(value),
}));

describe("ContentLanguageToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reflects the current preference", async () => {
    mockUseShowOriginalContent.mockReturnValue(true);

    await render(<ContentLanguageToggle />);

    expect(screen.getByTestId("content-language-toggle-switch").props.value).toBe(true);
  });

  it("updates the preference when toggled", async () => {
    mockUseShowOriginalContent.mockReturnValue(false);

    await render(<ContentLanguageToggle />);

    fireEvent(screen.getByTestId("content-language-toggle-switch"), "valueChange", true);

    expect(mockSetShowOriginalContent).toHaveBeenCalledWith(true);
  });
});
