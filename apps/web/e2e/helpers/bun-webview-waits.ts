import { waitForBrowserCondition } from "./bun-webview-harness";

type WaitOptions = {
  timeoutMs?: number;
  intervalMs?: number;
};

/** Waits until a selector is present in the hydrated document. */
export async function waitForSelector(
  view: Bun.WebView,
  selector: string,
  options?: WaitOptions,
): Promise<void> {
  await waitForBrowserCondition(
    view,
    `selector: ${selector}`,
    `document.querySelector(${JSON.stringify(selector)}) !== null`,
    options,
  );
}

/** Waits until the page contains the requested visible text. */
export async function waitForText(
  view: Bun.WebView,
  text: string,
  options?: WaitOptions,
): Promise<void> {
  await waitForBrowserCondition(
    view,
    `visible text: ${text}`,
    `document.body.textContent?.includes(${JSON.stringify(text)}) === true`,
    options,
  );
}

/** Waits until the current pathname and query string match exactly. */
export async function waitForPath(
  view: Bun.WebView,
  path: string,
  options?: WaitOptions,
): Promise<void> {
  await waitForBrowserCondition(
    view,
    `path: ${path}`,
    `location.pathname + location.search === ${JSON.stringify(path)}`,
    options,
  );
}

/** Waits until the browser's complete URL matches exactly. */
export async function waitForUrl(
  view: Bun.WebView,
  url: string,
  options?: WaitOptions,
): Promise<void> {
  await waitForBrowserCondition(
    view,
    `URL: ${url}`,
    `location.href === ${JSON.stringify(url)}`,
    options,
  );
}

/** Waits until a heading contains the requested text. */
export async function waitForHeading(
  view: Bun.WebView,
  text: string,
  options?: WaitOptions,
): Promise<void> {
  await waitForBrowserCondition(
    view,
    `heading: ${text}`,
    `[...document.querySelectorAll('h1, h2')].some((heading) => heading.textContent?.includes(${JSON.stringify(text)}))`,
    options,
  );
}
