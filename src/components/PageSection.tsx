import clsx from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = {
	children: ReactNode;
	className?: string;
	id?: string;
} & Omit<ComponentPropsWithoutRef<"section">, "children" | "className" | "id">;

/** Vertical page rhythm: 60 mobile / 100 desktop. Side gutters live on Container. */
export default function PageSection({
	children,
	className,
	id,
	...rest
}: Props) {
	return (
		<section
			id={id}
			className={clsx("py-[60px] md:py-[100px]", className)}
			{...rest}
		>
			{children}
		</section>
	);
}
