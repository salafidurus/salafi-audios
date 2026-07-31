import { lightNativeTheme } from "@/core/styles/theme";

import { getFormSheetScreenOptions, getTabStackScreenOptions } from "./stack-header-options";

describe("getTabStackScreenOptions", () => {
  it("returns tab-stack layout options with the themed header colors", () => {
    const options = getTabStackScreenOptions(lightNativeTheme);

    expect(options).toMatchObject({
      headerShown: true,
      headerTransparent: false,
      headerLargeTitle: true,
      headerStyle: { backgroundColor: lightNativeTheme.colors.surface.default },
      headerTintColor: lightNativeTheme.colors.content.strong,
      headerShadowVisible: false,
      headerTitleAlign: "left",
      contentStyle: {
        backgroundColor: lightNativeTheme.colors.surface.canvas,
        direction: lightNativeTheme.direction,
      },
    });
  });
});

describe("getFormSheetScreenOptions", () => {
  it("returns formSheet layout options with the themed header colors", () => {
    const options = getFormSheetScreenOptions(lightNativeTheme);

    expect(options).toMatchObject({
      headerShown: true,
      presentation: "formSheet",
      headerBackVisible: true,
      headerTitle: "",
      headerStyle: { backgroundColor: lightNativeTheme.colors.surface.default },
      headerTintColor: lightNativeTheme.colors.content.strong,
      headerShadowVisible: false,
      headerTitleAlign: "left",
      contentStyle: {
        backgroundColor: lightNativeTheme.colors.surface.canvas,
        direction: lightNativeTheme.direction,
      },
    });
  });

  it("resolves the same themed header colors as the tab-stack preset for a given theme", () => {
    const tabOptions = getTabStackScreenOptions(lightNativeTheme);
    const formSheetOptions = getFormSheetScreenOptions(lightNativeTheme);

    expect(formSheetOptions.headerStyle).toEqual(tabOptions.headerStyle);
    expect(formSheetOptions.headerTintColor).toEqual(tabOptions.headerTintColor);
    expect(formSheetOptions.headerShadowVisible).toEqual(tabOptions.headerShadowVisible);
  });
});
