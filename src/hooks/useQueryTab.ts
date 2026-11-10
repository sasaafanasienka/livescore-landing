"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { usePathname, useRouter } from "@/i18n/navigation";

/**
 * Sync a tab index with a dedicated GET param (independent of other params).
 */
export function useQueryTab(param: string, values: readonly string[]) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const selectedIndex = useMemo(() => {
		const raw = searchParams.get(param);
		const index = raw ? values.indexOf(raw) : -1;
		return index >= 0 ? index : 0;
	}, [param, searchParams, values]);

	const setSelectedIndex = useCallback(
		(index: number) => {
			const value = values[index] ?? values[0];
			const next = new URLSearchParams(searchParams.toString());
			if (index <= 0) {
				next.delete(param);
			} else {
				next.set(param, value);
			}
			const query = next.toString();
			router.replace(query ? `${pathname}?${query}` : pathname, {
				scroll: false,
			});
		},
		[param, pathname, router, searchParams, values],
	);

	return [selectedIndex, setSelectedIndex] as const;
}
