import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { darkNativeTheme, lightNativeTheme } from "@/core/styles/theme";

import { getNativeHostConfiguration } from "./native-host-configuration";
import { NativeBridgeHost, NativeScreenHost } from "./native-ui-host";

describe("Native UI hosts", () => {
  it("maps light LTR design tokens to Expo UI host configuration", () => {
    expect(getNativeHostConfiguration(lightNativeTheme)).toEqual({
      colorScheme: "light",
      layoutDirection: "leftToRight",
      seedColor: lightNativeTheme.colors.action.primary,
    });
  });

  it("maps dark RTL design tokens to Expo UI host configuration", () => {
    expect(
      getNativeHostConfiguration({
        ...darkNativeTheme,
        direction: "rtl",
      }),
    ).toEqual({
      colorScheme: "dark",
      layoutDirection: "rightToLeft",
      seedColor: darkNativeTheme.colors.action.primary,
    });
  });

  it("configures a full-screen viewport host", async () => {
    await render(
      <NativeScreenHost testID="screen-host">
        <Text>Content</Text>
      </NativeScreenHost>,
    );

    expect(screen.getByTestId("screen-host").props).toMatchObject({
      colorScheme: "light",
      layoutDirection: "leftToRight",
      seedColor: lightNativeTheme.colors.action.primary,
      useViewportSizeMeasurement: true,
    });
  });

  it("configures a content-sized bridge host", async () => {
    await render(
      <NativeBridgeHost testID="bridge-host">
        <Text>Bridge</Text>
      </NativeBridgeHost>,
    );

    expect(screen.getByTestId("bridge-host").props).toMatchObject({
      matchContents: true,
      colorScheme: "light",
      layoutDirection: "leftToRight",
    });
  });
});
