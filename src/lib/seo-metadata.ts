import type { Metadata } from "next";

import { siteDetails } from "@/data/siteDetails";
import { locales, type UrlLocale } from "@/i18n/routing";
import { getPageMarkdown } from "@/lib/content";
import { absoluteMarketingPageUrl } from "@/lib/seo-sitemap";

const META_TITLE_MAX = 60;
const META_DESCRIPTION_MAX = 155;

/** Per-locale OG/Twitter asset; ar falls back to en until a dedicated asset ships. */
export function localeOgImagePath(locale: UrlLocale): string {
	if (locale === "ar") {
		return "/images/og-en.jpg";
	}
	return `/images/og-${locale}.jpg`;
}

type PageMetaFields = {
	title?: string;
	description?: string;
};

/**
 * Per-page Metadata `alternates`: absolute self-canonical for the active
 * URL locale plus reciprocal hreflang for all six URL slugs and `x-default` → en.
 * Hreflang keys are URL locales (`pt`, not `pt-BR`).
 */
export function marketingPageAlternates(
	locale: UrlLocale,
	urlPath: string,
): NonNullable<Metadata["alternates"]> {
	const languages: Record<string, string> = {
		...Object.fromEntries(
			locales.map((loc) => [loc, absoluteMarketingPageUrl(loc, urlPath)]),
		),
		"x-default": absoluteMarketingPageUrl("en", urlPath),
	};

	return {
		canonical: absoluteMarketingPageUrl(locale, urlPath),
		languages,
	};
}

/**
 * Per-page, per-locale title/description + OG/Twitter, with story 3.2 alternates.
 * Prefers YAML frontmatter `title`/`description` when present; otherwise derives
 * claim-safe text from brand line + first body paragraph.
 */
export async function marketingPageMetadata(
	locale: UrlLocale,
	urlPath: string,
	page: string,
): Promise<Metadata> {
	const markdown = await getPageMarkdown(locale, page);
	const { title, description } = pageMetaTextFromMarkdown(markdown);
	const url = absoluteMarketingPageUrl(locale, urlPath);
	const ogImage = localeOgImagePath(locale);

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url,
			type: "website",
			images: [
				{
					url: ogImage,
					width: 1200,
					height: 630,
					alt: siteDetails.siteName,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [ogImage],
		},
		alternates: marketingPageAlternates(locale, urlPath),
	};
}

/** Exported for matrix verification of frontmatter vs derive paths. */
export function pageMetaTextFromMarkdown(markdown: string): {
	title: string;
	description: string;
} {
	const { fields, body } = splitOptionalFrontmatter(markdown);
	const derived = derivePageMetaFromBody(body);

	return {
		title: fields?.title?.trim() || derived.title,
		description: fields?.description?.trim() || derived.description,
	};
}

/**
 * Thin frontmatter split: only `title` / `description` scalars.
 * Invalid or unclosed YAML → treat as no frontmatter and derive from full markdown.
 */
function splitOptionalFrontmatter(markdown: string): {
	fields: PageMetaFields | null;
	body: string;
} {
	if (!markdown.startsWith("---")) {
		return { fields: null, body: markdown };
	}

	const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n([\s\S]*))?$/.exec(
		markdown,
	);
	if (!match) {
		return { fields: null, body: markdown };
	}

	const yamlBlock = match[1] ?? "";
	const body = (match[2] ?? "").trim();

	try {
		const fields = parseSimpleMetaYaml(yamlBlock);
		return { fields, body };
	} catch {
		return { fields: null, body: markdown };
	}
}

function parseSimpleMetaYaml(block: string): PageMetaFields | null {
	const fields: PageMetaFields = {};

	for (const rawLine of block.split(/\r?\n/)) {
		if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) {
			continue;
		}
		// Reject indented / list / nested YAML — fall back to derive.
		if (/^\s/.test(rawLine) || /^\s*-\s/.test(rawLine)) {
			throw new Error("complex yaml");
		}

		const match = /^(title|description)\s*:\s*(.*)$/.exec(rawLine.trim());
		if (!match) {
			continue;
		}

		const key = match[1] as "title" | "description";
		let value = (match[2] ?? "").trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		fields[key] = value;
	}

	if (!fields.title && !fields.description) {
		return null;
	}
	return fields;
}

function derivePageMetaFromBody(body: string): {
	title: string;
	description: string;
} {
	const lines = body.trim().split(/\r?\n/);
	let brand = siteDetails.siteName;
	let brandLineIndex = -1;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]?.trim();
		// Skip sole-token placeholder lines like privacy/terms `TODO`.
		if (line && line !== "TODO") {
			brand = line;
			brandLineIndex = i;
			break;
		}
	}

	const afterBrand =
		brandLineIndex >= 0
			? lines.slice(brandLineIndex + 1).join("\n").trim()
			: body.trim();
	const paragraphs = afterBrand
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
		.filter(Boolean);
	const lede = paragraphs[0] ?? "";
	const ledeSentence = firstSentence(lede) || brand;

	return {
		title: truncateAtWord(`${brand} — ${ledeSentence}`, META_TITLE_MAX),
		description: truncateAtWord(lede || brand, META_DESCRIPTION_MAX),
	};
}

function firstSentence(text: string): string {
	const match = text.match(/^[\s\S]+?[.!؟?！。](?=\s|$)/);
	return (match?.[0] ?? text).trim();
}

function truncateAtWord(text: string, max: number): string {
	const normalized = text.replace(/\s+/g, " ").trim();
	if (normalized.length <= max) {
		return normalized;
	}

	const slice = normalized.slice(0, max);
	const lastSpace = slice.lastIndexOf(" ");
	if (lastSpace < Math.floor(max * 0.6)) {
		return slice.trimEnd();
	}
	return slice.slice(0, lastSpace).trimEnd();
}
