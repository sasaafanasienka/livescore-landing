import { siteDetails } from "@/data/siteDetails";
import { stripOptionalFrontmatter } from "@/lib/content";

export type FaqQaPair = {
	question: string;
	answer: string;
};

type JsonLdObject = Record<string, unknown>;

/**
 * Claim-safe Organization JSON-LD from siteDetails / SERVICE-CAPABILITIES.
 * Brand Live Score; sameAs = Telegram bot URL only.
 */
export function organizationJsonLd(): JsonLdObject {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: siteDetails.siteName,
		url: siteDetails.siteUrl,
		sameAs: [siteDetails.botUrl],
	};
}

/**
 * Claim-safe SoftwareApplication JSON-LD for the Telegram football scores product.
 * Offers omitted — never personal Premium; Chat Premium is group/channel-only.
 */
export function softwareApplicationJsonLd(): JsonLdObject {
	return {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: siteDetails.siteName,
		applicationCategory: "SportsApplication",
		operatingSystem: "Telegram, Web",
		url: siteDetails.siteUrl,
		description: siteDetails.metadata.description,
	};
}

/**
 * FAQPage JSON-LD from locale FAQ markdown.
 * Parser: skip brand line; `Question?` + following answer block(s);
 * trailing CTA line without `?` is not a question.
 */
export function faqPageJsonLd(markdown: string): JsonLdObject {
	const pairs = extractFaqPairs(markdown);

	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: pairs.map(({ question, answer }) => ({
			"@type": "Question",
			name: question,
			acceptedAnswer: {
				"@type": "Answer",
				text: answer,
			},
		})),
	};
}

/** Next.js JSON-LD sanitize: scrub `<` → `\u003c` to prevent script breakout. */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Exported for verification of FAQ Q/A extraction. */
export function extractFaqPairs(markdown: string): FaqQaPair[] {
	const body = stripOptionalFrontmatter(markdown);
	// Blank-line blocks: brand; then `Question?\nanswer…`; trailing CTA block has no `?`.
	const blocks = body
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.filter((block) => block.length > 0);

	if (blocks.length === 0) {
		return [];
	}

	const pairs: FaqQaPair[] = [];

	for (const block of blocks.slice(1)) {
		const lines = block
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter((line) => line.length > 0);
		if (lines.length === 0) {
			continue;
		}

		const question = lines[0];
		// Match seo-metadata firstSentence terminators: ASCII ?, Arabic ؟, fullwidth ？.
		if (!/[?؟？]$/.test(question)) {
			// Trailing CTA / non-question prose — not a question.
			continue;
		}

		const answer = lines.slice(1).join(" ").trim();
		if (!answer) {
			continue;
		}

		pairs.push({ question, answer });
	}

	return pairs;
}
