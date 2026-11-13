import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		// Local files in public/. The Workers optimizer needs a paid Images binding.
		unoptimized: true,
		qualities: [75, 90],
	},
	outputFileTracingIncludes: {
		"/[locale]": ["./content/**/*"],
	},
	async rewrites() {
		return [
			{
				source: "/sitemaps/:locale.xml",
				destination: "/sitemaps/:locale",
			},
		];
	},
};

export default withNextIntl(nextConfig);

// `next dev` imports this config with AsyncLocalStorage set, which makes the helper
// start a local wrangler session. Skip it for `next build` so production traces
// do not load `.dev.vars`.
if (process.env.NODE_ENV === "development") {
	await initOpenNextCloudflareForDev();
}
