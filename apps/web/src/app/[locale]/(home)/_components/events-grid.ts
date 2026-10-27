import type { BrandSkin } from '@event-space/shared';

/** The catalogue grid, shared by the list and its skeleton so they never differ in shape. */
export function eventsGridClass(skin: BrandSkin): string {
	if (skin === 'listing') return 'flex flex-col gap-3 py-4 sm:gap-4 sm:py-6 mx-auto w-full max-w-5xl';

	return skin === 'minimal'
		? 'grid grid-cols-1 gap-x-6 gap-y-10 py-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
		: 'grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 sm:gap-6 sm:py-6 lg:grid-cols-3 lg:gap-8 2xl:grid-cols-4';
}
