import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ScreenInProgress } from "./ScreenInProgress";

describe("ScreenInProgress", () => {
  it("renders its default copy through Expo UI text", async () => {
    await render(
      <SafeAreaProvider
        initialMetrics={{
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
          frame: { x: 0, y: 0, width: 320, height: 640 },
        }}
      >
        <ScreenInProgress />
      </SafeAreaProvider>,
    );

    expect(screen.getByText("Coming Soon").props.textStyle).toEqual(
      expect.objectContaining({ fontSize: 20, textAlign: "center" }),
    );
    expect(screen.getByText("This feature is under development")).toBeTruthy();
  });
});
