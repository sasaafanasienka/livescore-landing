import MarketingMarkdownPage from "@/components/MarketingMarkdownPage";
import { MARKETING_PAGES } from "@/lib/content";

type Props = {
	params: { locale: string };
};

export default async function LocaleHomePage({ params }: Props) {
	return (
		<MarketingMarkdownPage locale={params.locale} page={MARKETING_PAGES.home} />
	);
}
