import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { SettingsRow } from "./SettingsRow";

describe("SettingsRow", () => {
  it("does not disable native controls through a non-clickable row wrapper", async () => {
    await render(
      <SettingsRow label="Notifications">
        <Text>Toggle</Text>
      </SettingsRow>,
    );

    expect(screen.getByText("Toggle")).toBeTruthy();
    expect(screen.getByText("Toggle").parent?.parent?.type).toBe("View");
  });

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
    const flattenedStyle = Array.isArray(stackedContent.props.style)
      ? Object.assign({}, ...stackedContent.props.style)
      : stackedContent.props.style;
    expect(flattenedStyle.width).toBe("100%");
  });
});
