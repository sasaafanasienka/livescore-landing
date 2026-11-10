import type { ReactNode } from "react";

import { siteDetails } from "@/data/siteDetails";

const PLACEHOLDERS: Record<string, string> = {
	botUrl: siteDetails.botUrl,
	botChatUrl: siteDetails.botChatUrl,
	botSettingsUrl: siteDetails.botSettingsUrl,
	botGroupUrl: siteDetails.botGroupUrl,
	botChannelUrl: siteDetails.botChannelUrl,
};

const TOKEN_RE = /(\{\{(\w+)\}\}|\[([^\]]+)\]\(([^)]+)\))/g;

/** Expand `{{botUrl}}` / markdown `[label](url|{{token}})` into inline nodes. */
export function renderRichText(input: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	let key = 0;

	TOKEN_RE.lastIndex = 0;
	while ((match = TOKEN_RE.exec(input)) !== null) {
		if (match.index > lastIndex) {
			nodes.push(input.slice(lastIndex, match.index));
		}

		if (match[2]) {
			nodes.push(PLACEHOLDERS[match[2]] ?? match[0]);
		} else {
			const label = match[3] ?? "";
			const rawHref = match[4] ?? "";
			const token = rawHref.match(/^\{\{(\w+)\}\}$/)?.[1];
			const href = token ? (PLACEHOLDERS[token] ?? rawHref) : rawHref;
			nodes.push(
				<a
					key={`a-${key++}`}
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className="font-medium text-secondary underline-offset-4 hover:underline"
				>
					{label}
				</a>,
			);
		}

		lastIndex = match.index + match[0].length;
	}

	if (lastIndex < input.length) {
		nodes.push(input.slice(lastIndex));
	}

	return nodes;
}
