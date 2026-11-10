import {
	type ComponentPropsWithoutRef,
	type ElementType,
	type ReactNode,
} from "react";
import clsx from "clsx";

const baseClasses =
	"inline-flex w-full min-[481px]:w-auto items-center justify-center text-center text-balance rounded-full px-8 py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

const variantClasses = {
	primary:
		"bg-primary text-white hover:bg-primary-accent",
	outline:
		"border-2 border-primary bg-transparent text-foreground hover:bg-primary/10",
} as const;

type As = "button" | "a";
type Variant = keyof typeof variantClasses;

type ButtonProps<T extends As> = {
	as?: T;
	variant?: Variant;
	children: ReactNode;
	className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export default function Button<T extends As = "button">({
	as,
	variant = "primary",
	className,
	children,
	...props
}: ButtonProps<T>) {
	const Comp = (as ?? "button") as ElementType;

	return (
		<Comp
			className={clsx(baseClasses, variantClasses[variant], className)}
			{...(Comp === "button" ? { type: "button" } : null)}
			{...props}
		>
			{children}
		</Comp>
	);
}
