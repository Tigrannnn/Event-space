import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getBrandForHost, isBrandModuleEnabled } from '@/config/brands';
import { serverFetch } from '@/lib/server.api';
import PromoCodesTable from './_components/PromoCodesTable';
import type { PaginatedResponse, PromoCode } from '@event-space/shared';

export default async function PromoCodesPage() {
	const brand = getBrandForHost((await headers()).get('host'));
	if (!isBrandModuleEnabled(brand, 'promoCodes')) notFound();

	const promoCodes = await serverFetch<PaginatedResponse<PromoCode>>('/admin/promo-codes');

	return (
		<div className="space-y-6">
			<PromoCodesTable initialPromoCodes={promoCodes} />
		</div>
	);
}
