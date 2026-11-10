import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
	children: ReactNode;
	className?: string;
};

/** Horizontal page gutters: 16 mobile / 40 desktop. No vertical padding. */
export default function Container({ children, className }: Props) {
	return (
		<div className={clsx("mx-auto w-full max-w-7xl px-4 md:px-10", className)}>
			{children}
		</div>
	);
}
