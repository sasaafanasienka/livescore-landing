import { ISocials } from "@/types";
import { menuItems } from "@/data/menuItems";

export const footerDetails: {
	quickLinks: typeof menuItems;
	email: string;
	telephone: string;
	socials: ISocials;
} = {
	quickLinks: menuItems,
	email: "",
	telephone: "",
	socials: {},
};
