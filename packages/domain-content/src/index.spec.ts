import { domainContentVersion } from "./index";

describe("domain-content", () => {
  it("exports a version string", () => {
    expect(typeof domainContentVersion).toBe("string");
  });
});
