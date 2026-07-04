import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../api/categories.api';

export const useCategories = () => {
	return useQuery({
		queryKey: ['categories'],
		queryFn: () => categoryApi.getCategories(),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};
