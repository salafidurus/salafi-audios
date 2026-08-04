import { render, screen } from "@testing-library/react-native";

import { NativeIcon } from "./native-icon";
import { nativeIconSources, type NativeIconName } from "./native-icon-sources";

describe("NativeIcon", () => {
  it.each<NativeIconName>([
    "add",
    "back",
    "check",
    "close",
    "delete",
    "download",
    "edit",
    "error",
    "more",
    "pause",
    "play",
    "search",
    "settings",
    "success",
  ])("defines a cross-platform source for %s", (name) => {
    expect(nativeIconSources[name]).toBeDefined();
  });

  it("forwards semantic color, size, and accessibility metadata", async () => {
    await render(
      <NativeIcon
        name="play"
        colorRole="primary"
        size={24}
        accessibilityLabel="Play lecture"
        testID="play-icon"
      />,
    );

    expect(screen.getByTestId("play-icon").props).toMatchObject({
      accessibilityLabel: "Play lecture",
      size: 24,
    });
  });
});
