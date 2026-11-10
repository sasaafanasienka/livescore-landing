import Typograf from "typograf";

import type { UrlLocale } from "@/i18n/routing";

/**
 * Locale → Typograf locales. Full rule packs: `ru`, `en-US`.
 * Other site locales fall back to `en-US` (+ common rules).
 */
const LOCALE_MAP: Record<UrlLocale, string[]> = {
	ar: ["en-US"],
	en: ["en-US"],
	es: ["en-US"],
	fr: ["en-US"],
	pt: ["en-US"],
	ru: ["ru", "en-US"],
};

const cache = new Map<string, Typograf>();

function getTypograf(urlLocale: UrlLocale): Typograf {
	const key = urlLocale;
	const hit = cache.get(key);
	if (hit) {
		return hit;
	}

	const tp = new Typograf({ locale: LOCALE_MAP[urlLocale] });
	// Hang short words (prepositions/conjunctions) with nbsp; keep dashes from line starts.
	tp.enableRule("common/nbsp/afterShortWord");
	tp.enableRule("common/nbsp/afterShortWordByList");
	tp.enableRule("common/nbsp/beforeShortLastWord");
	tp.setSetting("common/nbsp/afterShortWord", "lengthShortWord", 3);

	cache.set(key, tp);
	return tp;
}

/** Typograph a plain string (UTF nbsp / dashes / quotes). Empty → empty. */
export function typografText(text: string, locale: UrlLocale): string {
	if (!text) {
		return text;
	}
	return getTypograf(locale).execute(text);
}

/** Deep-map every string leaf through Typograf (objects/arrays preserved). */
export function typografDeep<T>(value: T, locale: UrlLocale): T {
	if (typeof value === "string") {
		return typografText(value, locale) as T;
	}
	if (Array.isArray(value)) {
		return value.map((item) => typografDeep(item, locale)) as T;
	}
	if (value && typeof value === "object") {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			out[k] = typografDeep(v, locale);
		}
		return out as T;
	}
	return value;
}
