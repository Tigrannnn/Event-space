'use client';

import { useState, type FormEvent } from 'react';
import { Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import type { PaginatedResponse, SafeUserData, UserRoleType } from '@event-space/shared';
import Button from '@/components/ui/Buttons/Button';
import Select from '@/components/ui/Select';
import TablePagination from '@/components/ui/TablePagination';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/Table';
import { useConfirm } from '@/hooks/confirmModal';
import { useAdminUsers, useDeleteUser, useUpdateUserRole } from '@/features/admin/hooks/useAdmin';

interface UsersTableProps {
	initialUsers: PaginatedResponse<SafeUserData>;
}

const roles: UserRoleType[] = ['USER', 'ORGANIZER', 'ADMIN'];
const pageSizes = [10, 20, 50, 100];
const roleOptions = roles.map((role) => ({ value: role, label: role }));
const roleFilterOptions = [{ value: 'ALL', label: 'All roles' }, ...roleOptions];
const emailVerifiedOptions = [
	{ value: 'ALL', label: 'All statuses' },
	{ value: 'true', label: 'Verified' },
	{ value: 'false', label: 'Pending' },
];
const pageSizeOptions = pageSizes.map((pageSize) => ({
	value: String(pageSize),
	label: `${pageSize} / page`,
}));

function formatDate(value: SafeUserData['createdAt']) {
	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(new Date(value));
}

export default function UsersTable({ initialUsers }: UsersTableProps) {
	const [skip, setSkip] = useState(initialUsers.skip);
	const [limit, setLimit] = useState(initialUsers.take);
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [role, setRole] = useState<UserRoleType | 'ALL'>('ALL');
	const [emailVerified, setEmailVerified] = useState<'ALL' | 'true' | 'false'>('ALL');
	const confirm = useConfirm();
	const { data, isFetching } = useAdminUsers({
		skip,
		limit,
		search: search || undefined,
		role: role === 'ALL' ? undefined : role,
		emailVerified: emailVerified === 'ALL' ? undefined : emailVerified === 'true',
	});
	const updateUserRole = useUpdateUserRole();
	const deleteUser = useDeleteUser();
	const usersResponse = data?.data ?? initialUsers;
	const pageStart = usersResponse.total === 0 ? 0 : usersResponse.skip + 1;
	const pageEnd = Math.min(usersResponse.skip + usersResponse.data.length, usersResponse.total);
	const canGoPrevious = usersResponse.skip > 0;
	const canGoNext = usersResponse.hasMore && usersResponse.nextSkip !== null;
	const hasActiveFilters = Boolean(search || role !== 'ALL' || emailVerified !== 'ALL');

	const resetPagination = () => {
		setSkip(0);
	};

	const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSearch(searchInput.trim());
		resetPagination();
	};

	const handleRoleFilterChange = (value: string) => {
		setRole(value as UserRoleType | 'ALL');
		resetPagination();
	};

	const handleEmailVerifiedFilterChange = (value: string) => {
		setEmailVerified(value as 'ALL' | 'true' | 'false');
		resetPagination();
	};

	const handlePageSizeChange = (value: string) => {
		setLimit(Number(value));
		resetPagination();
	};

	const handleResetFilters = () => {
		setSearchInput('');
		setSearch('');
		setRole('ALL');
		setEmailVerified('ALL');
		resetPagination();
	};

	const handleRoleChange = (userId: string, role: UserRoleType) => {
		updateUserRole.mutate({ id: userId, role });
	};

	const handlePreviousPage = () => {
		setSkip((currentSkip) => Math.max(currentSkip - limit, 0));
	};

	const handleNextPage = () => {
		if (usersResponse.nextSkip !== null) {
			setSkip(usersResponse.nextSkip);
		}
	};

	const handleDelete = async (user: SafeUserData) => {
		const confirmed = await confirm({
			title: 'Delete user',
			message: `Delete ${user.name}? This will remove the account permanently.`,
			confirmText: 'Delete',
			variant: 'danger',
		});

		if (confirmed) {
			deleteUser.mutate(user.id);
		}
	};

	return (
		<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
			<div className="flex flex-col gap-4 px-3 py-3 sm:px-5 sm:py-4">
				<div>
					<p className="font-semibold text-gray-900 dark:text-gray-100">All users</p>
					<p className="text-sm text-gray-500">
						Showing {pageStart}-{pageEnd} of {usersResponse.total} accounts
					</p>
				</div>

				<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
					<form onSubmit={handleSearchSubmit} className="flex min-w-0 flex-1 gap-2">
						<div className="relative min-w-0 flex-1">
							<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<input
								value={searchInput}
								onChange={(event) => setSearchInput(event.target.value)}
								placeholder="Search by name or email"
								className="focus:border-primary h-10 w-full rounded-md border border-gray-500 bg-transparent pr-3 pl-9 text-sm transition outline-none placeholder:text-gray-400"
							/>
						</div>
						<Button type="submit" size="sm" variant="secondary" disabled={isFetching}>
							Search
						</Button>
					</form>

					<div className="flex flex-wrap items-center gap-2">
						<div className="flex h-10 items-center gap-2 rounded-md border border-gray-500 px-3 text-sm text-gray-500">
							<SlidersHorizontal className="h-4 w-4" />
							Filters
						</div>

						<Select value={role} onValueChange={handleRoleFilterChange} options={roleFilterOptions} />

						<Select
							value={emailVerified}
							onValueChange={handleEmailVerifiedFilterChange}
							options={emailVerifiedOptions}
						/>

						<Select value={limit} onValueChange={handlePageSizeChange} options={pageSizeOptions} />

						{hasActiveFilters && (
							<Button type="button" size="sm" variant="secondary" onClick={handleResetFilters}>
								<X className="h-4 w-4" />
								Reset
							</Button>
						)}
					</div>
				</div>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="px-3 sm:px-5">User</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Created</TableHead>
						<TableHead className="w-24">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{usersResponse.data.length === 0 && (
						<TableRow>
							<TableCell colSpan={5} className="px-3 py-8 text-center text-gray-500 sm:px-5">
								No users found
							</TableCell>
						</TableRow>
					)}

					{usersResponse.data.map((user) => (
						<TableRow key={user.id}>
							<TableCell className="px-3 sm:px-5">
								<div className="max-w-md min-w-0">
									<p className="truncate font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
									<p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
								</div>
							</TableCell>
							<TableCell>
								<Select
									value={user.role}
									onValueChange={(value) => handleRoleChange(user.id, value as UserRoleType)}
									disabled={updateUserRole.isPending}
									size="sm"
									options={roleOptions}
								/>
							</TableCell>
							<TableCell>
								<span
									className={
										user.emailVerified
											? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
											: 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
									}
								>
									{user.emailVerified ? 'Verified' : 'Pending'}
								</span>
							</TableCell>
							<TableCell>{formatDate(user.createdAt)}</TableCell>
							<TableCell className="text-right">
								<Button
									type="button"
									size="xs"
									variant="danger"
									onClick={() => handleDelete(user)}
									isLoading={deleteUser.isPending}
									aria-label={`Delete ${user.name}`}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<TablePagination
				skip={usersResponse.skip}
				limit={limit}
				isLoading={isFetching}
				canGoPrevious={canGoPrevious}
				canGoNext={canGoNext}
				onPreviousPage={handlePreviousPage}
				onNextPage={handleNextPage}
			/>
		</div>
	);
}
