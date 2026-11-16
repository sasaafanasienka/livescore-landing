import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * next-intl may emit `hreflang="x-default"` → `/` while HTML/sitemap use `/en`.
 * Force every x-default Link entry onto `{origin}/en`.
 */
function rewriteXDefaultLinkHeader(link: string, origin: string): string {
	return link
		.split(/,\s*/)
		.map((part) => {
			if (!/hreflang=["']?x-default["']?/i.test(part)) {
				return part;
			}
			return part.replace(/<[^>]+>/, `<${origin}/en>`);
		})
		.join(", ");
}

export default function middleware(request: NextRequest) {
	// Permanent pin: `/` → `/en` (x-default). Do not negotiate Accept-Language here.
	if (request.nextUrl.pathname === "/") {
		const target = request.nextUrl.clone();
		target.pathname = "/en";
		return NextResponse.redirect(target, 308);
	}

	const response = intlMiddleware(request);
	const link = response.headers.get("link");
	if (link && /hreflang=["']?x-default["']?/i.test(link)) {
		response.headers.set(
			"link",
			rewriteXDefaultLinkHeader(link, request.nextUrl.origin),
		);
	}

	return response;
}

export const config = {
	matcher: ["/", "/(ar|en|es|fr|pt|ru)/:path*"],
};
