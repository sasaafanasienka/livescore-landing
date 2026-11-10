import Container from "./Container";
import PageSection from "./PageSection";
import SectionTitle from "./SectionTitle";

interface Props {
	id: string;
	title: string;
	description: string;
}

const Section: React.FC<React.PropsWithChildren<Props>> = ({
	id,
	title,
	description,
	children,
}: React.PropsWithChildren<Props>) => {
	return (
		<PageSection id={id}>
			<Container>
				<SectionTitle>
					<h2 className="mb-4 text-start md:text-center">{title}</h2>
				</SectionTitle>
				<p className="mb-12 text-start md:text-center">{description}</p>
				{children}
			</Container>
		</PageSection>
	);
};

export default Section;
