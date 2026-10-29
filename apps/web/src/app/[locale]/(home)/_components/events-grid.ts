import type { BrandSkin } from '@event-space/shared';

/** The catalogue grid, shared by the list and its skeleton so they never differ in shape. */
export function eventsGridClass(skin: BrandSkin): string {
	if (skin === 'soft') return 'grid grid-cols-1 gap-5 py-5 sm:grid-cols-2 sm:gap-6 sm:py-6 lg:grid-cols-3 2xl:grid-cols-4';

	if (skin === 'drawer')
		return 'mx-auto grid w-full max-w-7xl grid-cols-2 gap-3 py-4 sm:grid-cols-3 sm:gap-5 sm:py-6 lg:grid-cols-4';

	if (skin === 'market')
		return 'grid grid-cols-2 gap-x-3 gap-y-6 py-4 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 sm:py-6 lg:grid-cols-4 xl:grid-cols-5 mx-auto w-full max-w-[1400px]';

	if (skin === 'listing') return 'flex flex-col gap-3 py-4 sm:gap-4 sm:py-6 mx-auto w-full max-w-[1336px]';

	return skin === 'minimal'
		? 'grid grid-cols-1 gap-x-6 gap-y-10 py-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
		: 'grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 sm:gap-6 sm:py-6 lg:grid-cols-3 lg:gap-8 2xl:grid-cols-4';
}

/** Most a page of the catalogue ever shows: three rows of the widest grid (five columns). */
export const CATALOGUE_FETCH_LIMIT = 15;

export const CATALOGUE_ROWS = 3;

/** On a phone the cards are shown six at a time, whatever the skin lays them out as. */
export const CATALOGUE_MOBILE_PAGE = 6;

const MOBILE_MAX_WIDTH = 640;

/** How many cards one step of the catalogue reveals: three rows on a wide screen, six on a phone. */
export function cataloguePageSize(grid: HTMLElement): number {
	if (window.innerWidth < MOBILE_MAX_WIDTH) return CATALOGUE_MOBILE_PAGE;

	const template = getComputedStyle(grid).gridTemplateColumns;
	const columns = template && template !== 'none' ? template.split(' ').length : 1;

	return Math.min(columns * CATALOGUE_ROWS, CATALOGUE_FETCH_LIMIT);
}
