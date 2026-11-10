import type { MetadataRoute } from "next";

import { absoluteSitemapIndexUrl } from "@/lib/seo-sitemap";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: absoluteSitemapIndexUrl(),
	};
}
