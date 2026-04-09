import { cookies, headers } from "next/headers";
import { resolveLocale, type Locale } from "@sd/core-i18n";
import { LOCALE_COOKIE } from "./locale-cookie";

export async function getServerLocale(): Promise<Locale> {
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (fromCookie) return resolveLocale(fromCookie);
  const reqHeaders = await headers();
  return resolveLocale(reqHeaders.get("accept-language"));
}
