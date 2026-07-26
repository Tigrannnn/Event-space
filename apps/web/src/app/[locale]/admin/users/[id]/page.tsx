import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server.api';
import { PaginatedResponse, SafeUserData } from '@event-space/shared';
import UsersTable from '../_components/UsersTable';

interface UserPageProps {
	params: { locale: string; id: string };
}

export default async function UserPage({ params }: UserPageProps) {
	const { id } = params;

	try {
		const user = await serverFetch<SafeUserData>(`/admin/users/${id}`);
		const initialUsers: PaginatedResponse<SafeUserData> = {
			data: [user],
			total: 1,
			skip: 0,
			take: 1,
			hasMore: false,
			nextSkip: null,
		};

		return (
			<div className="space-y-6">
				<UsersTable initialUsers={initialUsers} disableFetch />
			</div>
		);
	} catch (error) {
		console.error(error);
		notFound();
	}
}
