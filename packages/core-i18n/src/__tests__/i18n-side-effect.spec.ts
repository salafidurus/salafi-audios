import i18nextLib from "i18next";

import "../index";

describe("@sd/core-i18n module load", () => {
  it("does not initialize the shared i18next singleton as a side effect of import", () => {
    expect(Boolean(i18nextLib.isInitialized)).toBe(false);
  });
});
