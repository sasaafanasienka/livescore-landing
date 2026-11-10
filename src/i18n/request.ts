import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { typografDeep } from "@/lib/typograf";

import { routing, type UrlLocale } from "./routing";

/** Skip ICU message templates — Typograf must not touch `{count, plural, …}`. */
function typografMessages<T>(value: T, locale: UrlLocale): T {
	if (typeof value === "string") {
		if (value.includes("{")) {
			return value;
		}
		return typografDeep(value, locale);
	}
	if (Array.isArray(value)) {
		return value.map((item) => typografMessages(item, locale)) as T;
	}
	if (value && typeof value === "object") {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			out[k] = typografMessages(v, locale);
		}
		return out as T;
	}
	return value;
}

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale;
	const locale = hasLocale(routing.locales, requested)
		? requested
		: routing.defaultLocale;

	const raw = (await import(`../../messages/${locale}.json`)).default;

	return {
		locale,
		messages: typografMessages(raw, locale as UrlLocale),
	};
});
