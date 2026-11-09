import { IMenuItem, ISocials } from "@/types";

export const footerDetails: {
	subheading: string;
	quickLinks: IMenuItem[];
	email: string;
	telephone: string;
	socials: ISocials;
} = {
	subheading: "Live football scores and match updates via Telegram.",
	quickLinks: [
		{
			text: "privacy",
			url: "/privacy",
		},
		{
			text: "terms",
			url: "/terms",
		},
	],
	email: "",
	telephone: "",
	socials: {},
};
