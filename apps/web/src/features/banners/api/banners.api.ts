import clientApi from '@/lib/client.api';
import type { Banner } from '@event-space/shared';

export const bannersApi = {
	getActiveBanners: () => clientApi.get<Banner[]>('/banners').then((res) => res.data),
};
