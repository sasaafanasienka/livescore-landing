import { serializeJsonLd } from "@/lib/seo-jsonld";

type Props = {
	/** One JSON-LD object, or several adjacent script payloads. */
	data: object | object[];
};

/**
 * Native `application/ld+json` script tag(s) — not `next/script`.
 * Server Component; uses serializeJsonLd for `<` scrubbing.
 */
export default function JsonLdScript({ data }: Props) {
	const items = Array.isArray(data) ? data : [data];

	return (
		<>
			{items.map((item, index) => (
				<script
					key={index}
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: serializeJsonLd(item) }}
				/>
			))}
		</>
	);
}
