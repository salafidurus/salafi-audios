import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { SettingsRow } from "./SettingsRow";

describe("SettingsRow", () => {
  it("stacks the control below the label in its own full-width row when stacked", async () => {
    await render(
      <SettingsRow label="Theme" sublabel="System follows your OS preference" stacked>
        <Text>Control</Text>
      </SettingsRow>,
    );

    expect(screen.getByText("Theme")).toBeTruthy();
    expect(screen.getByText("System follows your OS preference")).toBeTruthy();
    expect(screen.getByText("Control")).toBeTruthy();

    const stackedContent = screen.getByTestId("settings-row-stacked-content");
    expect(stackedContent).toBeTruthy();
  });
});
