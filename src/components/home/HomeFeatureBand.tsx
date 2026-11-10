import Image from "next/image";
import clsx from "clsx";

import Container from "@/components/Container";
import SectionTitle from "@/components/SectionTitle";

type Props = {
	id: string;
	title: string;
	description: string;
	bullets: string[];
	imageSrc: string;
	imageAlt: string;
	imageAtRight?: boolean;
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
}: Props) {
	return (
		<section id={id} className="py-10 lg:py-20">
			<Container>
				<div
					className={clsx(
						"flex flex-col items-center gap-10 lg:flex-row lg:gap-16",
						!imageAtRight && "lg:flex-row-reverse",
					)}
				>
					<div className="w-full max-w-xl text-center lg:text-start">
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
							width={384}
							height={762}
							quality={90}
							className="mx-auto h-auto w-full"
						/>
					</div>
				</div>
			</Container>
		</section>
	);
}
