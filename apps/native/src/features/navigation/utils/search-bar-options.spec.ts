import { lightNativeTheme } from "@/core/styles/theme";

import { getThemedSearchBarOptions } from "./search-bar-options";

describe("getThemedSearchBarOptions", () => {
  it("returns themed colors for the native header search bar", () => {
    const options = getThemedSearchBarOptions(lightNativeTheme);

    expect(options).toEqual({
      textColor: lightNativeTheme.colors.content.default,
      headerIconColor: lightNativeTheme.colors.content.default,
      hintTextColor: lightNativeTheme.colors.content.muted,
      tintColor: lightNativeTheme.colors.action.primary,
      barTintColor: lightNativeTheme.colors.surface.subtle,
    });
  });
});
