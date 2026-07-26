import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server.api';
import { Category, PaginatedResponse } from '@event-space/shared';
import CategoriesTable from '../_components/CategoriesTable';

interface CategoryPageProps {
	params: { locale: string; id: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
	const { id } = params;

	try {
		const category = await serverFetch<Category>(`/admin/categories/${id}`);
		const initialCategories: PaginatedResponse<Category> = {
			data: [category],
			total: 1,
			skip: 0,
			take: 1,
			hasMore: false,
			nextSkip: null,
		};

		return (
			<div className="space-y-6">
				<CategoriesTable initialCategories={initialCategories} disableFetch />
			</div>
		);
	} catch (error) {
		console.error(error);
		notFound();
	}
}
