"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { HiChevronDown } from "react-icons/hi2";

import { usePathname, useRouter } from "@/i18n/navigation";
import { URL_LOCALES, type UrlLocale } from "@/i18n/routing";

export default function LocaleSwitcher() {
	const t = useTranslations("Shell");
	const locale = useLocale() as UrlLocale;
	const pathname = usePathname();
	const router = useRouter();
	const listId = useId();
	const rootRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) {
			return;
		}

		const onPointerDown = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
			}
		};

		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [open]);

	const onSelect = (next: UrlLocale) => {
		setOpen(false);
		if (next === locale) {
			return;
		}
		router.replace(pathname, { locale: next });
	};

	return (
		<div ref={rootRef} className="relative">
			<button
				type="button"
				className="inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-foreground-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
				aria-label={t("language")}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				onClick={() => setOpen((value) => !value)}
			>
				<span lang={locale}>{locale.toUpperCase()}</span>
				<HiChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
			</button>
			{open ? (
				<ul
					id={listId}
					role="listbox"
					aria-label={t("language")}
					className="absolute end-0 z-[60] mt-1 min-w-[4.5rem] rounded-md border border-gray-200 bg-white py-1 shadow-md focus:outline-none"
				>
					{URL_LOCALES.map((code) => {
						const selected = code === locale;
						return (
							<li key={code} role="option" aria-selected={selected}>
								<button
									type="button"
									lang={code}
									className={`w-full cursor-pointer px-3 py-2 text-start text-foreground hover:bg-gray-100 ${
										selected ? "bg-gray-50" : ""
									}`}
									onClick={() => onSelect(code)}
								>
									{code.toUpperCase()}
								</button>
							</li>
						);
					})}
				</ul>
			) : null}
		</div>
	);
}
