export function canonical(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}
