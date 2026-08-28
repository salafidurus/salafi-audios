/** Provides SSR-safe checks for browser globals used by client-only behavior. */
/** Returns whether the current runtime exposes the document object. */
export function hasDocument(): boolean {
  return globalThis.document !== undefined;
}

/** Returns whether the current runtime exposes the browser window object. */
export function hasWindow(): boolean {
  return globalThis.window !== undefined;
}

/** Returns whether the current runtime exposes browser navigation metadata. */
export function hasNavigator(): boolean {
  return globalThis.navigator !== undefined;
}

/** Returns whether native media metadata events can be constructed in this runtime. */
export function hasMediaMetadataConstructor(): boolean {
  return globalThis.MediaMetadata !== undefined;
}

/** Narrows an event target to an HTMLElement without throwing in non-browser runtimes. */
export function isHtmlElement(target: EventTarget | null): target is HTMLElement {
  return target instanceof HTMLElement;
}
