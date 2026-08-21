import type { ReactNode } from "react";

import { z } from "zod";

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

export function isReactNodeText(node: ReactNode): node is string {
  return z.string().safeParse(node).success;
}

export function isHtmlElement(target: EventTarget | null): target is HTMLElement {
  return target instanceof HTMLElement;
}

export function isNode(target: EventTarget | null): target is Node {
  return target instanceof Node;
}
