import { fireEvent, render } from "@testing-library/react-native";

import { NativeProgress } from "./native-progress";
import { NativeSegmentedControl } from "./native-segmented-control";

describe("native platform controls", () => {
  it("renders determinate progress with the design-system accent", async () => {
    const view = await render(
      <NativeProgress value={0.4} variant="linear" testID="upload-progress" />,
    );

    expect(view.getByTestId("upload-progress").props).toMatchObject({
      value: 0.4,
    });
  });

  it("reports the selected segmented-control value", async () => {
    const onValueChange = jest.fn();
    const view = await render(
      <NativeSegmentedControl
        values={["Published", "Drafts"]}
        value="Published"
        onValueChange={onValueChange}
        testID="status-filter"
      />,
    );

    await fireEvent.press(view.getByRole("button", { name: "Drafts" }));
    expect(onValueChange).toHaveBeenCalledWith("Drafts");
  });
});
