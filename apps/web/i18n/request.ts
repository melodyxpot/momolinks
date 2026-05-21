import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, LOCALE_COOKIE, type Locale } from "./config";

function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/**
 * Pick the best match from the Accept-Language header against our supported
 * locales. Example header: "tr-TR,tr;q=0.9,en;q=0.8" → "tr".
 */
function detectFromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      const quality = q ? parseFloat(q.slice(2)) : 1;
      return { tag: (tag ?? "").toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return undefined;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  let locale: Locale;
  if (isLocale(cookieLocale)) {
    // Explicit user choice always wins.
    locale = cookieLocale;
  } else {
    const headerStore = await headers();
    locale =
      detectFromAcceptLanguage(headerStore.get("accept-language")) ?? defaultLocale;
  }

  const messages = (await import(`../messages/${locale}.json`)).default;
  return { locale, messages };
});
