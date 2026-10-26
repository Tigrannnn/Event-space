import { serverFetch } from '@/lib/server.api';
import PromoCodesTable from './_components/PromoCodesTable';
import type { PaginatedResponse, PromoCode } from '@event-space/shared';

export default async function PromoCodesPage() {
	const promoCodes = await serverFetch<PaginatedResponse<PromoCode>>('/admin/promo-codes');

	return (
		<div className="space-y-6">
			<PromoCodesTable initialPromoCodes={promoCodes} />
		</div>
	);
}
