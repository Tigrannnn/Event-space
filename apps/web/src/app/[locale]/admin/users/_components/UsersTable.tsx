'use client';

import { useState, type FormEvent } from 'react';
import { Search, Trash2, X, Eye } from 'lucide-react';
import Button from '@/components/ui/Buttons/Button';
import Badge from '@/components/ui/Badge';
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
import { useModalStore, ModalType } from '@/stores';
import { PaginatedResponse, SafeUserData, UserRoleSchema, UserRoleType } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

const pageSizeOptions = [10, 20, 50, 100].map((pageSize) => ({
	value: String(pageSize),
	label: `${pageSize} / page`,
}));

interface UsersTableProps {
	initialUsers: PaginatedResponse<SafeUserData>;
}

function formatDate(value: SafeUserData['createdAt']) {
	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(new Date(value));
}

export default function UsersTable({ initialUsers }: UsersTableProps) {
	const translate = useTranslation();
	const [skip, setSkip] = useState(initialUsers.skip);
	const [limit, setLimit] = useState(initialUsers.take);
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [role, setRole] = useState<UserRoleType | undefined>();
	const [emailVerified, setEmailVerified] = useState<boolean | undefined>();
	const confirm = useConfirm();
	const { data, isFetching } = useAdminUsers({
		skip,
		limit,
		search: search || undefined,
		role,
		emailVerified,
	});
	const { openModal } = useModalStore();
	const updateUserRole = useUpdateUserRole();
	const deleteUser = useDeleteUser();
	const usersResponse = data ?? initialUsers;
	const pageStart = usersResponse.total === 0 ? 0 : usersResponse.skip + 1;
	const pageEnd = Math.min(usersResponse.skip + usersResponse.data.length, usersResponse.total);
	const canGoPrevious = usersResponse.skip > 0;
	const canGoNext = usersResponse.hasMore && usersResponse.nextSkip !== null;
	const hasActiveFilters = Boolean(search || role !== undefined || emailVerified !== undefined);
	const userRoleOptions = UserRoleSchema.options.map((userRole) => ({
		value: userRole,
		label: userRole === 'ADMIN' ? translate('admin.admin') : translate('admin.user'),
	}));

	const resetPagination = () => {
		setSkip(0);
	};

	const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSearch(searchInput.trim());
		resetPagination();
	};

	const handleRoleFilterChange = (value: string) => {
		setRole(value ? (value as UserRoleType) : undefined);
		resetPagination();
	};

	const handleEmailVerifiedFilterChange = (value: string) => {
		setEmailVerified(value === '' ? undefined : value === 'true');
		resetPagination();
	};

	const handlePageSizeChange = (value: string) => {
		setLimit(Number(value));
		resetPagination();
	};

	const handleResetFilters = () => {
		setSearchInput('');
		setSearch('');
		setRole(undefined);
		setEmailVerified(undefined);
		resetPagination();
	};

	const handleRoleChange = (userId: string, nextRole: UserRoleType) => {
		updateUserRole.mutate({ id: userId, role: nextRole });
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
			title: translate('admin.deleteUser'),
			message: `${translate('admin.deleteUserMessage')} ${user.name}`,
			confirmText: translate('admin.delete'),
			variant: 'danger',
		});

		if (confirmed) {
			deleteUser.mutate(user.id);
		}
	};

	const emailVerifiedFilterValue =
		emailVerified === undefined ? '' : emailVerified ? 'true' : 'false';

	return (
		<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
			<div className="flex flex-col gap-4 px-3 py-3 sm:px-5 sm:py-4">
				<div>
					<p className="font-semibold text-gray-900 dark:text-gray-100">{translate('admin.allUsers')}</p>
					<p className="text-sm text-gray-500">
						{translate('admin.showing')} {pageStart}-{pageEnd} {translate('admin.of')}{' '}
						{usersResponse.total} {translate('admin.accountsCount')}
					</p>
				</div>

				<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
					<form onSubmit={handleSearchSubmit} className="flex min-w-0 flex-1 gap-2">
						<div className="relative min-w-0 flex-1">
							<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<input
								value={searchInput}
								onChange={(event) => setSearchInput(event.target.value)}
								placeholder={translate('admin.searchUsersPlaceholder')}
								className="focus:border-primary h-10 w-full rounded-md border border-gray-500 bg-transparent pr-3 pl-9 text-sm transition outline-none placeholder:text-gray-400"
							/>
						</div>
						<Button type="submit" size="sm" variant="secondary" disabled={isFetching}>
							{translate('header.search')}
						</Button>
					</form>

					<div className="flex flex-wrap items-center gap-2">
						<Select
							value={role ?? ''}
							onValueChange={handleRoleFilterChange}
							options={[
								{ value: '', label: translate('admin.allRoles') },
								...UserRoleSchema.options.map((r) => ({
									value: r,
									label: r === 'ADMIN' ? translate('admin.admin') : translate('admin.user'),
								})),
							]}
						/>

						<Select
							value={emailVerifiedFilterValue}
							onValueChange={handleEmailVerifiedFilterChange}
							options={[
								{ value: '', label: translate('admin.allStatuses') },
								{ value: 'true', label: translate('admin.verified') },
								{ value: 'false', label: translate('admin.pending') },
							]}
						/>

						<Select
							value={limit}
							onValueChange={handlePageSizeChange}
							options={pageSizeOptions.map((ps) => ({
								...ps,
								label: `${ps.value} ${translate('admin.pageSize')}`,
							}))}
						/>

						{hasActiveFilters && (
							<Button type="button" size="sm" variant="secondary" onClick={handleResetFilters}>
								<X className="h-4 w-4" />
								{translate('admin.reset')}
							</Button>
						)}
					</div>
				</div>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="px-3 sm:px-5">{translate('admin.user')}</TableHead>
						<TableHead>{translate('admin.phone')}</TableHead>
						<TableHead>{translate('admin.role')}</TableHead>
						<TableHead>{translate('admin.status')}</TableHead>
						<TableHead>{translate('admin.created')}</TableHead>
						<TableHead className="w-32">{translate('admin.actions')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{usersResponse.data.length === 0 && (
						<TableRow>
							<TableCell colSpan={6} className="px-3 py-8 text-center text-gray-500 sm:px-5">
								{translate('admin.noUsersFound')}
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
								<p className="truncate text-sm text-gray-500 dark:text-gray-400">
									{user.phone || '-'}
								</p>
							</TableCell>
							<TableCell>
								<Select
									value={user.role}
									onValueChange={(value) => handleRoleChange(user.id, value as UserRoleType)}
									disabled={updateUserRole.isPending}
									size="sm"
									aria-label={`${translate('admin.role')}: ${user.name}`}
									options={userRoleOptions}
								/>
							</TableCell>
							<TableCell>
								<Badge
									variant={user.emailVerified ? 'success' : 'warning'}
									label={user.emailVerified ? translate('admin.verified') : translate('admin.pending')}
								/>
							</TableCell>
							<TableCell>{formatDate(user.createdAt)}</TableCell>
							<TableCell>
								<div className="flex gap-2">
									<Button
										type="button"
										size="xs"
										variant="secondary"
										onClick={() => openModal(ModalType.UserDetails, { user })}
										aria-label={`${translate('admin.viewDetails')}: ${user.name}`}
									>
										<Eye className="h-4 w-4" />
									</Button>
									<Button
										type="button"
										size="xs"
										variant="danger"
										onClick={() => handleDelete(user)}
										isLoading={deleteUser.isPending}
										aria-label={`${translate('admin.delete')}: ${user.name}`}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
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
