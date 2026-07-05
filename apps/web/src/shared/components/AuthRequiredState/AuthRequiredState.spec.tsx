import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthRequiredState } from "./AuthRequiredState";

describe("AuthRequiredState", () => {
  const props = {
    title: "Sign in to access this page",
    description: "Please sign in to continue.",
  };

  it("renders title and description", () => {
    render(<AuthRequiredState {...props} />);
    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByText(props.description)).toBeInTheDocument();
  });

  it("opens AuthModal when clicking Sign In button", () => {
    render(<AuthRequiredState {...props} />);
    
    // AuthModal is closed by default
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click Sign In
    const signInButton = screen.getByRole("button", { name: "Sign In" });
    fireEvent.click(signInButton);

    // AuthModal should be open
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByLabelText("Continue with Apple")).toBeInTheDocument();
  });
});
