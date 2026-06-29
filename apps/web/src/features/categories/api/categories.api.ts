import clientApi from '@/lib/client.api';
import { Category } from '@event-space/shared';

export const categoryApi = {
	getCategories: () => clientApi.get<Category[]>('/categories').then((res) => res.data),
};
