import { serverFetch } from '@/lib/server.api';
import type { Banner } from '@event-space/shared';
import BannersList from './_components/BannersList';

export default async function BannersPage() {
	const banners = await serverFetch<Banner[]>('/banners/admin').catch((error) => {
		console.error('Error fetching banners:', error);
		return [] as Banner[];
	});

	return (
		<div className="space-y-6">
			<BannersList initialBanners={banners} />
		</div>
	);
}
