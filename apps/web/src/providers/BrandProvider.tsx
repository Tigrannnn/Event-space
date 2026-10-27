'use client';

import { createContext, useContext } from 'react';
import { DEFAULT_BRAND_SKIN, type BrandSkin } from '@event-space/shared';
import type { Brand } from '@/config/brands';

const BrandContext = createContext<Brand | null>(null);

export function BrandProvider({ brand, children }: { brand: Brand; children: React.ReactNode }) {
	return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand(): Brand {
	const brand = useContext(BrandContext);
	if (!brand) {
		throw new Error('useBrand must be used within a BrandProvider');
	}
	return brand;
}

export function useSkin(): BrandSkin {
	return useBrand().skin ?? DEFAULT_BRAND_SKIN;
}
