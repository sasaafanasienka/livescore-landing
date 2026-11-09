import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { siteDetails } from "@/data/siteDetails";
import { routing } from "@/i18n/routing";

const inter = Inter({ subsets: ["latin"] });

type Props = {
	children: ReactNode;
	params: { locale: string };
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
	metadataBase: new URL(siteDetails.siteUrl),
	title: siteDetails.metadata.title,
	description: siteDetails.metadata.description,
	openGraph: {
		title: siteDetails.metadata.title,
		description: siteDetails.metadata.description,
		url: siteDetails.siteUrl,
		type: "website",
		images: [
			{
				url: "/images/og-image.jpg",
				width: 1200,
				height: 675,
				alt: siteDetails.siteName,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: siteDetails.metadata.title,
		description: siteDetails.metadata.description,
		images: ["/images/twitter-image.jpg"],
	},
};

export default async function LocaleLayout({ children, params }: Props) {
	const { locale } = params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);

	const messages = await getMessages();
	const dir = locale === "ar" ? "rtl" : "ltr";

	return (
		<html lang={locale} dir={dir}>
			<body className={`${inter.className} antialiased`}>
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
