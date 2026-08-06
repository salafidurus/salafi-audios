import { lightNativeTheme } from "@/core/styles/theme";

import { getFormSheetScreenOptions, getTabStackScreenOptions } from "./stack-header-options";

describe("getTabStackScreenOptions", () => {
  it("returns tab-stack layout options with the themed header colors", () => {
    const options = getTabStackScreenOptions(lightNativeTheme);

    expect(options).toMatchObject({
      headerShown: false,
      headerStyle: { backgroundColor: lightNativeTheme.colors.surface.canvas },
      headerLargeStyle: { backgroundColor: lightNativeTheme.colors.surface.canvas },
      headerTintColor: lightNativeTheme.colors.content.strong,
      headerShadowVisible: false,
      contentStyle: {
        backgroundColor: lightNativeTheme.colors.surface.canvas,
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
      headerStyle: { backgroundColor: lightNativeTheme.colors.surface.canvas },
      headerTintColor: lightNativeTheme.colors.content.strong,
      headerShadowVisible: false,
      contentStyle: {
        backgroundColor: lightNativeTheme.colors.surface.canvas,
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
