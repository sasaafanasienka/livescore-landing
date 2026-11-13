import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { siteDetails } from "@/data/siteDetails";
import { fontHeading, fontSans } from "@/lib/fonts";
import { routing } from "@/i18n/routing";

type Props = {
	children: ReactNode;
	params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
	metadataBase: new URL(siteDetails.siteUrl),
	title: siteDetails.metadata.title,
	description: siteDetails.metadata.description,
	verification: {
		google: siteDetails.googleSiteVerification,
	},
	openGraph: {
		title: siteDetails.metadata.title,
		description: siteDetails.metadata.description,
		url: siteDetails.siteUrl,
		type: "website",
		images: [
			{
				url: "/images/og-en.jpg",
				width: 1714,
				height: 900,
				alt: siteDetails.siteName,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: siteDetails.metadata.title,
		description: siteDetails.metadata.description,
		images: ["/images/og-en.jpg"],
	},
};

export default async function LocaleLayout({ children, params }: Props) {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);

	const messages = await getMessages();
	const dir = locale === "ar" ? "rtl" : "ltr";

	return (
		<html lang={locale} dir={dir}>
			<body
				className={`${fontSans.variable} ${fontHeading.variable} ${fontSans.className} antialiased`}
			>
				<NextIntlClientProvider messages={messages}>
					{siteDetails.googleAnalyticsId && (
						<GoogleAnalytics gaId={siteDetails.googleAnalyticsId} />
					)}
					<Header />
					<main>{children}</main>
					<Footer />
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
