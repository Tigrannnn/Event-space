'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export interface UrlFiltersConfig<T> {
	/** Builds the filter object from the current query string. */
	parse: (params: URLSearchParams) => T;
	/** Writes the filter object back, mutating a copy of the current params. */
	serialize: (params: URLSearchParams, filters: T) => URLSearchParams;
	/** The "nothing selected" value, used by `resetFilters`. */
	empty: () => T;
	/** How many of the filters are actually narrowing the result — drives the "· 3" badge. */
	countActive?: (filters: T) => number;
}

/**
 * Keeps a screen's filters in the URL instead of component state.
 *
 * The point is that a filtered view survives a reload, can be sent to someone else, and steps
 * back through browser history one filter at a time. `router.replace` is used rather than
 * `push` so each tweak refines the current entry instead of stacking a new one.
 */
export function useUrlFilters<T>({ parse, serialize, empty, countActive }: UrlFiltersConfig<T>) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const filters = useMemo(() => parse(searchParams), [searchParams, parse]);

	const applyToUrl = useCallback(
		(next: T) => {
			const params = serialize(new URLSearchParams(searchParams.toString()), next);
			const query = params.toString();
			router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
		},
		[pathname, router, searchParams, serialize],
	);

	const resetFilters = useCallback(() => applyToUrl(empty()), [applyToUrl, empty]);

	const activeCount = useMemo(
		() => (countActive ? countActive(filters) : 0),
		[countActive, filters],
	);

	return { filters, setFilters: applyToUrl, resetFilters, activeCount };
}
