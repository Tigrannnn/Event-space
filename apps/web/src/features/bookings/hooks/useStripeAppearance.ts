'use client';

import type { Appearance } from '@stripe/stripe-js';
import useSystemTheme from '@/hooks/systemTheme';
import { useBrand, useSkin } from '@/providers/BrandProvider';

/**
 * How the Stripe card fields look. Most skins take Stripe's own light or dark theme; the capsule
 * skin rounds the fields into pills and tints them with the brand's colour so the form inside the
 * payment window reads as part of the same site.
 */
export function useStripeAppearance(): Appearance {
	const theme = useSystemTheme();
	const skin = useSkin();
	const brand = useBrand();

	if (skin === 'capsule') {
		return {
			theme: 'stripe',
			variables: {
				colorPrimary: brand.colorPrimary,
				colorText: brand.colorPrimary,
				borderRadius: '22px',
				fontFamily: 'Montserrat, system-ui, sans-serif',
				fontWeightNormal: '500',
			},
		};
	}

	return { theme: theme === 'dark' ? 'night' : 'stripe' };
}
