import { render, screen } from "@testing-library/react";
import { ScreenInProgressResponsive } from "./ScreenInProgress";

describe("ScreenInProgressResponsive", () => {
  it("renders the title", () => {
    render(<ScreenInProgressResponsive title="My Title" description="My desc" />);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<ScreenInProgressResponsive title="My Title" description="My desc" />);
    expect(screen.getByText("My desc")).toBeInTheDocument();
  });

  it("renders a section element", () => {
    const { container } = render(
      <ScreenInProgressResponsive title="My Title" description="My desc" />,
    );
    expect(container.querySelector("section")).not.toBeNull();
  });

  it("uses default title when none provided", () => {
    render(<ScreenInProgressResponsive />);
    expect(screen.getByText("Screen in progress")).toBeInTheDocument();
  });
});
