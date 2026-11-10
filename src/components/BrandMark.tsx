"use client";

import Image from "next/image";
import clsx from "clsx";
import { useTranslations } from "next-intl";

import { fontHeading } from "@/lib/fonts";

type Props = {
	className?: string;
	/** Logo diameter in px — text scales with it. */
	size?: "sm" | "md";
	priority?: boolean;
};

const SIZES = {
	sm: { box: "h-8 w-8", text: "text-lg" },
	md: { box: "h-9 w-9 md:h-10 md:w-10", text: "text-xl md:text-2xl" },
} as const;

/**
 * Circular logo + Sofia Sans Condensed wordmark.
 * Logo asset is square with green corners — `rounded-full` crops to circle.
 */
export default function BrandMark({
	className,
	size = "md",
	priority = false,
}: Props) {
	const t = useTranslations("Brand");
	const s = SIZES[size];

	return (
		<span className={clsx("inline-flex items-center gap-2.5", className)}>
			<span
				className={clsx(
					"relative shrink-0 overflow-hidden rounded-full bg-[#28a705]",
					s.box,
				)}
			>
				<Image
					src="/images/logo.png"
					alt=""
					fill
					sizes="40px"
					className="object-cover object-center"
					priority={priority}
				/>
			</span>
			<span
				className={clsx(
					fontHeading.className,
					"font-heading leading-none font-bold tracking-tight text-foreground",
					s.text,
				)}
			>
				{t("name")}
			</span>
		</span>
	);
}
