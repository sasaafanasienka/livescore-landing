/**
 * Temporary root stub. File kept (no deletes); body unused when middleware handles `/`.
 * next-intl middleware (localeDetection: true, localeCookie: false) negotiates
 * Accept-Language on `/` → matching locale prefix (`ar|en|es|fr|pt|ru`), fallback `/en`.
 */
export default function RootPage() {
	return null;
}
