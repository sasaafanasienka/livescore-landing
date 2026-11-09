import { readFile } from "node:fs/promises";
import path from "node:path";

import {
	type UrlLocale,
	toProductLocale,
} from "@/i18n/routing";

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
