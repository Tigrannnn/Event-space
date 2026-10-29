import type { BrandSkin } from '@event-space/shared';

/** The skins that drop the classic gradients and run on one colour. */
export function isFlatSkin(skin: BrandSkin): boolean {
	return skin === 'minimal' || skin === 'listing' || skin === 'market';
}
