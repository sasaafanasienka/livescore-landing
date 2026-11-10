import { Inter, Sofia_Sans_Condensed } from "next/font/google";

export const fontSans = Inter({
	subsets: ["latin", "cyrillic"],
	variable: "--font-sans",
});

/** Headings + brand wordmark. */
export const fontHeading = Sofia_Sans_Condensed({
	subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
	weight: "variable",
	variable: "--font-heading",
});
