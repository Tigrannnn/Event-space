import { serverFetch } from '@/lib/server.api';
import type { PaginatedResponse, SafeUserData } from '@event-space/shared';
import UsersTable from './_components/UsersTable';

export default async function UsersPage() {
	const users = await serverFetch<PaginatedResponse<SafeUserData>>('/admin/users');

	return (
		<div className="space-y-6">
			<UsersTable initialUsers={users} />
		</div>
	);
}
