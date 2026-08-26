export function hasDocument(): boolean {
  return globalThis.document !== undefined;
}

export function hasWindow(): boolean {
  return globalThis.window !== undefined;
}

export function hasNavigator(): boolean {
  return globalThis.navigator !== undefined;
}

export function hasMediaMetadataConstructor(): boolean {
  return globalThis.MediaMetadata !== undefined;
}

export function isHtmlElement(target: EventTarget | null): target is HTMLElement {
  return target instanceof HTMLElement;
}
