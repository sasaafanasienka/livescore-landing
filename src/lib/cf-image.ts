/** Options for Cloudflare Image Transformations (`/cdn-cgi/image/…`). */
export type CloudflareImageOptions = {
	width: number;
	height?: number;
	fit?: "cover" | "contain" | "scale-down" | "crop" | "pad";
	format?: "auto" | "webp" | "avif" | "jpeg" | "png";
};

function buildOptions(options: CloudflareImageOptions): string {
	const parts = [
		`width=${options.width}`,
		options.height != null ? `height=${options.height}` : null,
		`fit=${options.fit ?? "cover"}`,
		`format=${options.format ?? "auto"}`,
	];
	return parts.filter(Boolean).join(",");
}

/**
 * Absolute http(s) sources → `/cdn-cgi/image/<opts>/<source>` in production.
 * Local/dev keeps the raw URL (no CF edge). Relative / non-http sources pass through.
 */
export function cloudflareImageUrl(
	source: string,
	options: CloudflareImageOptions,
): string {
	if (process.env.NODE_ENV !== "production") {
		return source;
	}
	if (!/^https?:\/\//i.test(source)) {
		return source;
	}
	return `/cdn-cgi/image/${buildOptions(options)}/${source}`;
}

/** Density `srcset` for fixed CSS size (e.g. 48×48 logos → 1x / 2x). */
export function cloudflareImageSrcSet(
	source: string,
	base: CloudflareImageOptions,
): string {
	const oneX = cloudflareImageUrl(source, base);
	const twoX = cloudflareImageUrl(source, {
		...base,
		width: base.width * 2,
		height: base.height != null ? base.height * 2 : undefined,
	});
	return `${oneX} 1x, ${twoX} 2x`;
}
