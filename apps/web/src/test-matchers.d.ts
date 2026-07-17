import type { Matchers } from "bun:test";

declare global {
  namespace BunTestMatchers {
    interface DOMMatchers<R> {
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveClass(className: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string | RegExp): R;
      toHaveTextContent(text: string | RegExp): R;
      toContainElement(element: Element | null): R;
      toBePartiallyChecked(): R;
      toHaveFormValues(values: Record<string, any>): R;
      toBeInvalid(): R;
      toBeValid(): R;
      toHaveErrorMessage(message: string): R;
      toHaveStyle(style: string | Record<string, any>): R;
      toHaveDisplayValue(value: string | number | string[] | number[]): R;
      toBeEmptyDOMElement(): R;
      toBeInTheDOM(): R;
      toHaveValue(value: string | number | string[] | number[]): R;
      toHaveFocus(): R;
      toBeChecked(): R;
      toHaveDescription(description?: string | RegExp): R;
    }
  }
}

declare module "bun:test" {
  interface Matchers<R> extends BunTestMatchers.DOMMatchers<R> {}
}

export {};
