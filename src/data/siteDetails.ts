export const siteDetails = {
	siteName: "Football. LIVE",
	siteUrl: "https://football-live-bot.online",
	botUrl: "https://t.me/LiveScoreAppBot/app",
	botChatUrl: "https://t.me/LiveScoreAppBot",
	botSettingsUrl: "https://t.me/LiveScoreAppBot/app?startapp=settings",
	botGroupUrl:
		"https://t.me/LiveScoreAppBot?startgroup=ref_landing&admin=post_messages",
	botChannelUrl:
		"https://t.me/LiveScoreAppBot?startchannel&admin=post_messages",
	metadata: {
		title: "Football. LIVE — live football scores via Telegram",
		description:
			"Live football scores and match updates through LiveScoreAppBot on Telegram.",
	},
	language: "en",
	locale: "en",
	siteLogo: `${process.env.BASE_PATH || ""}/images/logo.png`,
	googleAnalyticsId: "G-HWTR9NPBNX",
	googleSiteVerification: "Afvwu8yFpJR_Ox_-nH5fjPIErc-kZLh0y1Awma0PfJ0",
	privacyUrl: "https://telegram.org/privacy-tpa",
	termsUrl: "https://telegram.org/tos/mini-apps",
};

/** Localized product names + bot username for Organization.alternateName. */
export const brandAlternateNames = [
	"Football. LIVE",
	"Футбол. LIVE",
	"Fútbol. LIVE",
	"Futebol. LIVE",
	"LiveScoreAppBot",
] as const;
