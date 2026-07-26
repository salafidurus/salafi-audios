import { describe, it, expect } from "bun:test";
import { isKnownUnsupportedSource } from "./unsupported-sources";

describe("isKnownUnsupportedSource", () => {
  it("flags 1drv.ms short links", () => {
    expect(isKnownUnsupportedSource("https://1drv.ms/u/c/ea0b2657ad8f985f/abc?e=jZN72E")).toMatch(
      /OneDrive/i,
    );
  });

  it("flags onedrive.live.com links", () => {
    expect(isKnownUnsupportedSource("https://onedrive.live.com/redir?cid=abc&resid=abc")).toMatch(
      /OneDrive/i,
    );
  });

  it("flags sharepoint.com links", () => {
    expect(
      isKnownUnsupportedSource("https://contoso-my.sharepoint.com/personal/user/file.mp3"),
    ).toMatch(/OneDrive/i);
  });

  it("returns null for a supported host", () => {
    expect(isKnownUnsupportedSource("https://archive.org/details/ArafatTranslation")).toBeNull();
  });

  it("returns null for an unparseable input", () => {
    expect(isKnownUnsupportedSource("not a url")).toBeNull();
  });
});
