import Image from "next/image";
import clsx from "clsx";

import Container from "@/components/Container";
import PageSection from "@/components/PageSection";
import SectionTitle from "@/components/SectionTitle";

type Props = {
	id: string;
	title: string;
	description: string;
	bullets: string[];
	imageSrc: string;
	imageAlt: string;
	imageAtRight?: boolean;
	/** Intrinsic width for next/image; default keeps Mini App 384×762. */
	imageWidth?: number;
	/** Intrinsic height for next/image; default keeps Mini App 384×762. */
	imageHeight?: number;
	/** Responsive sizes so Next emits a useful srcset (max-w-sm = 24rem). */
	sizes?: string;
};

/** Screenshot + copy band (notifications / Mini App). */
export default function HomeFeatureBand({
	id,
	title,
	description,
	bullets,
	imageSrc,
	imageAlt,
	imageAtRight = true,
	imageWidth = 384,
	imageHeight = 762,
	sizes,
}: Props) {
	return (
		<PageSection id={id}>
			<Container>
				<div
					className={clsx(
						"flex flex-col items-start justify-center gap-10 md:items-center lg:flex-row lg:gap-16",
						!imageAtRight && "lg:flex-row-reverse",
					)}
				>
					<div className="w-full text-start lg:max-w-md">
						<SectionTitle>
							<h2 className="mb-4">{title}</h2>
						</SectionTitle>
						<p className="mb-6 text-foreground-accent">{description}</p>
						<ul className="flex flex-col gap-3 text-start">
							{bullets.map((bullet) => (
								<li
									key={bullet}
									className="border-s-2 border-secondary ps-4 text-base leading-relaxed"
								>
									{bullet}
								</li>
							))}
						</ul>
					</div>
					<div className="w-full max-w-sm shrink-0">
						<Image
							src={imageSrc}
							alt={imageAlt}
							width={imageWidth}
							height={imageHeight}
							sizes={sizes}
							quality={90}
							className="mx-auto h-auto w-full"
						/>
					</div>
				</div>
			</Container>
		</PageSection>
	);
}
