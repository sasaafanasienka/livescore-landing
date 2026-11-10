import { getTranslations } from "next-intl/server";

import Container from "@/components/Container";
import { Link } from "@/i18n/navigation";

/** Locale-segment 404 shell — deleted marketing paths must hard-404 here. */
export default async function LocaleNotFound() {
	const t = await getTranslations("Shell");

	return (
		<section className="flex min-h-[60vh] flex-col justify-center pb-[60px] pt-32 md:pb-[100px] md:pt-40">
			<Container>
				<div className="flex flex-col items-start gap-6 text-start md:items-center md:text-center">
					<h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
						404
					</h1>
					<Link
						href="/"
						className="text-base font-medium text-foreground underline-offset-4 hover:underline"
					>
						{t("navHome")}
					</Link>
				</div>
			</Container>
		</section>
	);
}
