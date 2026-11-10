import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
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
