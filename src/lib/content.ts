import { readFile } from "node:fs/promises";
import path from "node:path";

import {
	type UrlLocale,
	toProductLocale,
} from "@/i18n/routing";

/**
 * Locked marketing content filenames (no `.md`).
 * URL path map: see `MARKETING_SITEMAP` and `content/README.md`.
 * Indexable surface: locale homes only (`/{ar|en|es|fr|pt|ru}`).
 */
export const MARKETING_PAGES = {
	home: "home",
} as const;

export type MarketingPage =
	(typeof MARKETING_PAGES)[keyof typeof MARKETING_PAGES];

/** Path under `/{locale}/` without the locale prefix → content page slug. */
export const MARKETING_SITEMAP = [
	{ urlPath: "", page: MARKETING_PAGES.home },
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

/**
 * Drop optional leading `---` YAML fence for body render / parsers.
 * Unclosed or missing fence → return trimmed markdown unchanged.
 */
export function stripOptionalFrontmatter(markdown: string): string {
	if (!markdown.startsWith("---")) {
		return markdown.trim();
	}

	const match = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n([\s\S]*))?$/.exec(markdown);
	if (!match) {
		return markdown.trim();
	}

	return (match[1] ?? "").trim();
}
