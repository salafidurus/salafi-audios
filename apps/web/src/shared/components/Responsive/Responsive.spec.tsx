import { act, render, screen } from "@testing-library/react";
import { Responsive } from "./Responsive";

function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
}

const ORIGINAL_WIDTH = window.innerWidth;

afterEach(() => {
  setViewport(ORIGINAL_WIDTH);
});

describe("Responsive", () => {
  it("renders the desktop branch at a wide viewport (1440px)", async () => {
    setViewport(1440);
    render(
      <Responsive
        mobile={<span>mobile content</span>}
        desktop={<span>desktop content</span>}
      />,
    );
    // useEffect fires synchronously in act — wait for the state update
    expect(await screen.findByText("desktop content")).toBeInTheDocument();
    expect(screen.queryByText("mobile content")).not.toBeInTheDocument();
  });

  it("renders the mobile branch at a narrow viewport (320px)", async () => {
    setViewport(320);
    await act(async () => {
      render(
        <Responsive
          mobile={<span>mobile content</span>}
          desktop={<span>desktop content</span>}
        />,
      );
    });
    expect(await screen.findByText("mobile content")).toBeInTheDocument();
    expect(screen.queryByText("desktop content")).not.toBeInTheDocument();
  });

  it("defaults to desktop during SSR (isDesktop starts true)", () => {
    // Before any useEffect fires the initial state is desktop
    // This is validated by the useState(true) default — unit-test that the
    // desktop branch is present immediately after a synchronous render.
    render(
      <Responsive
        mobile={<span>mobile content</span>}
        desktop={<span>desktop content</span>}
      />,
    );
    // At render time (before effects) window.innerWidth defaults to jsdom's
    // value, but useState(true) guarantees the desktop branch is rendered first.
    // Use getBy (synchronous) to confirm no async wait is needed.
    expect(screen.getByText("desktop content")).toBeInTheDocument();
  });
});
