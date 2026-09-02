import { waitForBrowserCondition } from "./bun-webview-harness";

type WaitOptions = {
  timeoutMs?: number;
  intervalMs?: number;
};

const unsafeJsCharMap = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
} satisfies Record<string, string>;

function escapeUnsafeChars(value: string): string {
  return value.replace(
    /[<>/\u2028\u2029]/g,
    // SAFETY: the replacement regex above contains every key accepted here.
    (character) => unsafeJsCharMap[character as keyof typeof unsafeJsCharMap] ?? character,
  );
}

/** Encodes caller-controlled text as a safe JavaScript string literal. */
function toSafeJsStringLiteral(value: string): string {
  return escapeUnsafeChars(JSON.stringify(value));
}

/** Waits until a selector is present in the hydrated document. */
export async function waitForSelector(
  view: Bun.WebView,
  selector: string,
  options?: WaitOptions,
): Promise<void> {
  await waitForBrowserCondition(
    view,
    `selector: ${selector}`,
    `document.querySelector(${toSafeJsStringLiteral(selector)}) !== null`,
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
    `document.body.textContent?.includes(${toSafeJsStringLiteral(text)}) === true`,
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
    `location.pathname + location.search === ${toSafeJsStringLiteral(path)}`,
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
    `location.href === ${toSafeJsStringLiteral(url)}`,
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
    `[...document.querySelectorAll('h1, h2')].some((heading) => heading.textContent?.includes(${toSafeJsStringLiteral(text)}))`,
    options,
  );
}
