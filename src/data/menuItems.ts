import { IMenuItem } from "@/types";

/** Home-only shell nav — in-page anchors (+ optional tab query). */
export const menuItems: IMenuItem[] = [
	{
		text: "features",
		hash: "features",
	},
	{
		text: "forGroups",
		hash: "how-it-works",
		query: { how: "groups" },
	},
	{
		text: "forChannels",
		hash: "how-it-works",
		query: { how: "channels" },
	},
	{
		text: "faq",
		hash: "faq",
	},
];
