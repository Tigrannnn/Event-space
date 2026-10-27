import type { BrandSkin } from '@event-space/shared';

/** The catalogue grid, shared by the list and its skeleton so they never differ in shape. */
export function eventsGridClass(skin: BrandSkin): string {
	return skin === 'minimal'
		? 'grid grid-cols-1 gap-x-5 gap-y-9 py-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 xl:grid-cols-4 2xl:grid-cols-5'
		: 'grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 sm:gap-6 sm:py-6 lg:grid-cols-3 lg:gap-8 2xl:grid-cols-4';
}
