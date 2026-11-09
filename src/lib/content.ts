import { readFile } from "node:fs/promises";
import path from "node:path";

import {
	type UrlLocale,
	toProductLocale,
} from "@/i18n/routing";

/**
 * Locked marketing content filenames (no `.md`).
 * URL path map: see `MARKETING_SITEMAP` and `content/README.md`.
 */
export const MARKETING_PAGES = {
	home: "home",
	guideGroups: "guide-groups",
	guideChannels: "guide-channels",
	officialChannels: "official-channels",
	pricing: "pricing",
	faq: "faq",
	privacy: "privacy",
	terms: "terms",
} as const;

export type MarketingPage =
	(typeof MARKETING_PAGES)[keyof typeof MARKETING_PAGES];

/** Path under `/{locale}/` without the locale prefix → content page slug. */
export const MARKETING_SITEMAP = [
	{ urlPath: "", page: MARKETING_PAGES.home },
	{ urlPath: "guide/groups", page: MARKETING_PAGES.guideGroups },
	{ urlPath: "guide/channels", page: MARKETING_PAGES.guideChannels },
	{ urlPath: "official-channels", page: MARKETING_PAGES.officialChannels },
	{ urlPath: "pricing", page: MARKETING_PAGES.pricing },
	{ urlPath: "faq", page: MARKETING_PAGES.faq },
	{ urlPath: "privacy", page: MARKETING_PAGES.privacy },
	{ urlPath: "terms", page: MARKETING_PAGES.terms },
] as const;

/**
 * Reads `content/{productLocale}/{page}.md`.
 * Product locale ids: ar, en, es, fr, pt-BR, ru (URL `/pt` → `pt-BR`).
 */
export async function getPageMarkdown(
	urlLocale: UrlLocale,
	page: string,
): Promise<string> {
	const productLocale = toProductLocale(urlLocale);
	const filePath = path.join(
		process.cwd(),
		"content",
		productLocale,
		`${page}.md`,
	);
	const raw = await readFile(filePath, "utf8");
	return raw.trim();
}
