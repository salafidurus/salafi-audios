import { describe, it, expect } from "bun:test";
import { render } from "@testing-library/react";
import AccountLayout from "./layout";

describe("AccountLayout", () => {
  it("renders children for everyone (local-first mode)", () => {
    const { container } = render(
      <AccountLayout>
        <div>account content</div>
      </AccountLayout>,
    );
    expect(container.textContent).toContain("account content");
  });

  it("does not redirect unauthenticated users (local-first allows anonymous access)", () => {
    const { container } = render(
      <AccountLayout>
        <div>should render</div>
      </AccountLayout>,
    );
    // If it renders, no redirect happened
    expect(container.textContent).toContain("should render");
  });
});
