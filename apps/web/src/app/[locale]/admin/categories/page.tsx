import { serverFetch } from '@/lib/server.api';
import CategoriesTable from './_components/CategoriesTable';
import type { PaginatedResponse, Category } from '@event-space/shared';

export default async function CategoriesPage() {
	const categories = await serverFetch<PaginatedResponse<Category>>('/admin/categories');

	return (
		<div className="space-y-6">
			<CategoriesTable initialCategories={categories} />
		</div>
	);
}
