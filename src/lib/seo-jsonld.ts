import {
	brandAlternateNames,
	siteDetails,
} from "@/data/siteDetails";
import { stripOptionalFrontmatter } from "@/lib/content";

export type FaqQaPair = {
	question: string;
	answer: string;
};

type JsonLdObject = Record<string, unknown>;

const PLACEHOLDERS: Record<string, string> = {
	botUrl: siteDetails.botUrl,
	botChatUrl: siteDetails.botChatUrl,
	botSettingsUrl: siteDetails.botSettingsUrl,
	botGroupUrl: siteDetails.botGroupUrl,
	botChannelUrl: siteDetails.botChannelUrl,
};

/**
 * Claim-safe Organization JSON-LD from siteDetails / SERVICE-CAPABILITIES.
 * Canonical name Football. LIVE; sameAs = Telegram bot chat URL (not /app).
 */
export function organizationJsonLd(): JsonLdObject {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: siteDetails.siteName,
		url: siteDetails.siteUrl,
		logo: `${siteDetails.siteUrl}/images/logo.png`,
		description: siteDetails.metadata.description,
		sameAs: [siteDetails.botChatUrl],
		alternateName: [...brandAlternateNames],
	};
}

/**
 * Claim-safe SoftwareApplication JSON-LD for the Telegram football scores product.
 * Chat Premium offers are group/channel-only (49 Stars / 30 days).
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
		featureList: [
			"Football match notifications in personal Telegram chats, groups, and channels",
			"Mini App match centre with favourites and notification settings",
			"Official league channels list in the Mini App",
			"Chat Premium for groups and channels: 49 Telegram Stars / 30 days",
		],
		offers: {
			"@type": "Offer",
			name: "Chat Premium",
			description:
				"Group and channel subscription: unlimited team or league favourites. 49 Telegram Stars for 30 days.",
			price: "49",
			priceCurrency: "XTR",
		},
	};
}

/**
 * FAQPage JSON-LD from home structured FAQ items (already typograf'd when from getHomeCopy).
 */
export function faqPageJsonLd(pairs: FaqQaPair[]): JsonLdObject {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: pairs.map(({ question, answer }) => ({
			"@type": "Question",
			name: question,
			acceptedAnswer: {
				"@type": "Answer",
				text: plainFaqAnswer(answer),
			},
		})),
	};
}

/** Next.js JSON-LD sanitize: scrub `<` → `\u003c` to prevent script breakout. */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Expand `{{tokens}}` / markdown links to plain text for FAQ answers in schema.
 */
export function plainFaqAnswer(input: string): string {
	return input
		.replace(/\{\{(\w+)\}\}/g, (_, key: string) => PLACEHOLDERS[key] ?? "")
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, href: string) => {
			const token = href.match(/^\{\{(\w+)\}\}$/)?.[1];
			const url = token ? (PLACEHOLDERS[token] ?? href) : href;
			return url ? `${label} (${url})` : label;
		})
		.replace(/\s+/g, " ")
		.trim();
}

/** Exported for verification of FAQ Q/A extraction from legacy markdown. */
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
