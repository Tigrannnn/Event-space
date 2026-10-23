'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Eye, Ticket } from 'lucide-react';
import { startOfToday, subDays } from 'date-fns';
import { APP_TIME_ZONE } from '@event-space/shared';
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
import { useAdminUsers, useUpdateUserRole } from '@/features/admin/hooks/useAdmin';
import { useModalStore, ModalType } from '@/stores';
import { PaginatedResponse, SafeUserData, UserRoleSchema, UserRoleType } from '@event-space/shared';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/translation';
import { useConfirm } from '@/hooks/confirmModal';
import { useUrlFilters } from '@/hooks/urlFilters';
import AdminFilterBar from '../../_components/AdminFilterBar';
import {
	DateRangePicker,
	formatDateParam,
	parseDateParam,
	type DateRangePreset,
} from '@/components/filters';
import {
	countActiveUsersFilters,
	emptyUsersFilters,
	parseUsersFilters,
	serializeUsersFilters,
	type AdminUsersFilters,
} from './users-filters';

const pageSizeOptions = [10, 20, 50, 100].map((pageSize) => ({
	value: String(pageSize),
	label: `${pageSize} / page`,
}));

interface UsersTableProps {
	initialUsers: PaginatedResponse<SafeUserData>;
}

function formatDate(value: SafeUserData['createdAt']) {
	return new Intl.DateTimeFormat('en', {
		timeZone: APP_TIME_ZONE,
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(new Date(value));
}

export default function UsersTable({ initialUsers }: UsersTableProps) {
	const translate = useTranslation();
	const confirm = useConfirm();
	const router = useRouter();
	const { filters, setFilters, resetFilters, activeCount } = useUrlFilters({
		parse: parseUsersFilters,
		serialize: serializeUsersFilters,
		empty: emptyUsersFilters,
		countActive: countActiveUsersFilters,
	});
	const { skip, limit, role, emailVerified, createdFrom, createdTo, isShadow } = filters;

	const [searchInput, setSearchInput] = useState(filters.search ?? '');
	useEffect(() => {
		setSearchInput(filters.search ?? '');
	}, [filters.search]);

	const { data, isFetching } = useAdminUsers(filters);
	const { openModal } = useModalStore();
	const updateUserRole = useUpdateUserRole();
	const usersResponse = data ?? initialUsers;
	const pageStart = usersResponse.total === 0 ? 0 : usersResponse.skip + 1;
	const pageEnd = Math.min(usersResponse.skip + usersResponse.data.length, usersResponse.total);
	const canGoPrevious = usersResponse.skip > 0;
	const canGoNext = usersResponse.hasMore && usersResponse.nextSkip !== null;
	const hasActiveFilters = activeCount > 0;
	const userRoleOptions = UserRoleSchema.options.map((userRole) => ({
		value: userRole,
		label: userRole === 'ADMIN' ? translate('admin.admin') : translate('admin.user'),
	}));

	const registeredPresets: DateRangePreset[] = [7, 30, 90].map((days) => ({
		key: `last-${days}`,
		label: translate('admin.lastDays', { days }),
		getRange: () => ({ from: subDays(startOfToday(), days - 1), to: startOfToday() }),
	}));

	const applyFilter = (patch: Partial<AdminUsersFilters>) => {
		setFilters({ ...filters, ...patch, skip: 0 });
	};

	const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		applyFilter({ search: searchInput.trim() || undefined });
	};

	const handleResetFilters = () => {
		setSearchInput('');
		resetFilters();
	};

	const handleRoleChange = async (user: SafeUserData, nextRole: UserRoleType) => {
		if (nextRole === user.role) return;

		const isConfirmed = await confirm({
			title: translate('admin.changeRoleTitle'),
			message: (
				<p>
					{translate(
						nextRole === UserRoleSchema.enum.ADMIN
							? 'admin.changeRoleToAdmin'
							: 'admin.changeRoleToUser',
					)}{' '}
					<span className="font-medium">{user.name}</span>
					{user.email ? ` (${user.email})` : ''}
				</p>
			),
			size: 'sm',
			confirmText: translate('admin.changeRoleConfirm'),
			cancelText: translate('booking.close'),
			variant: nextRole === UserRoleSchema.enum.ADMIN ? 'danger' : 'primary',
		});

		if (isConfirmed) {
			updateUserRole.mutate({ id: user.id, role: nextRole });
		}
	};

	const handlePreviousPage = () => {
		setFilters({ ...filters, skip: Math.max(skip - limit, 0) });
	};

	const handleNextPage = () => {
		if (usersResponse.nextSkip !== null) {
			setFilters({ ...filters, skip: usersResponse.nextSkip });
		}
	};

	const emailVerifiedFilterValue =
		emailVerified === undefined ? '' : emailVerified ? 'true' : 'false';
	const shadowFilterValue = isShadow === undefined ? '' : isShadow ? 'true' : 'false';

	return (
		<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
			<div className="flex flex-col gap-4 px-3 py-3 sm:px-5 sm:py-4">
				<div>
					<p className="text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100">{translate('admin.allUsers')}</p>
					<p className="text-xs text-gray-500 sm:text-sm">
						{translate('admin.showing')} {pageStart}-{pageEnd} {translate('admin.of')}{' '}
						{usersResponse.total} {translate('admin.accountsCount')}
					</p>
				</div>

				<AdminFilterBar
					searchValue={searchInput}
					onSearchValueChange={setSearchInput}
					onSearchSubmit={handleSearchSubmit}
					searchPlaceholder={translate('admin.searchUsersPlaceholder')}
					isFetching={isFetching}
					activeCount={activeCount}
					showReset={hasActiveFilters}
					onReset={handleResetFilters}
				>
					<Select
						variant="filter"
						size="sm"
						isActive={role !== undefined}
						value={role ?? ''}
						onValueChange={(value) => applyFilter({ role: (value as UserRoleType) || undefined })}
						options={[
							{ value: '', label: translate('admin.allRoles') },
							...UserRoleSchema.options.map((r) => ({
								value: r,
								label: r === 'ADMIN' ? translate('admin.admin') : translate('admin.user'),
							})),
						]}
					/>

					<Select
						variant="filter"
						size="sm"
						isActive={emailVerified !== undefined}
						value={emailVerifiedFilterValue}
						onValueChange={(value) =>
							applyFilter({ emailVerified: value === '' ? undefined : value === 'true' })
						}
						options={[
							{ value: '', label: translate('admin.allStatuses') },
							{ value: 'true', label: translate('admin.verified') },
							{ value: 'false', label: translate('admin.pending') },
						]}
					/>

					<Select
						variant="filter"
						size="sm"
						isActive={isShadow !== undefined}
						value={shadowFilterValue}
						onValueChange={(value) =>
							applyFilter({ isShadow: value === '' ? undefined : value === 'true' })
						}
						options={[
							{ value: '', label: translate('admin.allAccounts') },
							{ value: 'false', label: translate('admin.realAccounts') },
							{ value: 'true', label: translate('admin.shadowAccounts') },
						]}
					/>

					<DateRangePicker
						value={
							createdFrom || createdTo
								? {
										from: parseDateParam(createdFrom ?? createdTo ?? null) ?? new Date(),
										to: parseDateParam(createdTo ?? createdFrom ?? null) ?? new Date(),
									}
								: null
						}
						onChange={(range) =>
							applyFilter({
								createdFrom: range ? formatDateParam(range.from) : undefined,
								createdTo: range ? formatDateParam(range.to) : undefined,
							})
						}
						placeholder={translate('admin.registeredPeriod')}
						disabled={{ after: new Date() }}
						presets={registeredPresets}
					/>

					<Select
						variant="filter"
						size="sm"
						value={limit}
						onValueChange={(value) => applyFilter({ limit: Number(value) })}
						options={pageSizeOptions.map((ps) => ({
							...ps,
							label: `${ps.value} ${translate('admin.pageSize')}`,
						}))}
					/>
				</AdminFilterBar>
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
									<p className="truncate text-xs text-gray-500 sm:text-sm dark:text-gray-400">{user.email}</p>
								</div>
							</TableCell>
							<TableCell>
								<p className="truncate text-xs text-gray-500 sm:text-sm dark:text-gray-400">{user.phone || '-'}</p>
							</TableCell>
							<TableCell>
								<Select
									value={user.role}
									onValueChange={(value) => void handleRoleChange(user, value as UserRoleType)}
									disabled={updateUserRole.isPending}
									size="sm"
									aria-label={`${translate('admin.role')}: ${user.name}`}
									options={userRoleOptions}
								/>
							</TableCell>
							<TableCell>
								<Badge
									variant={user.isShadow ? 'info' : user.emailVerified ? 'success' : 'warning'}
									label={
										user.isShadow
											? translate('admin.guestAccount')
											: user.emailVerified
												? translate('admin.verified')
												: translate('admin.pending')
									}
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
										variant="secondary"
										onClick={() =>
											router.push(
												`/admin/bookings?search=${encodeURIComponent(user.email ?? user.name)}`,
											)
										}
										aria-label={`${translate('admin.userBookings')}: ${user.name}`}
										title={translate('admin.userBookings')}
									>
										<Ticket className="h-4 w-4" />
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
