import { UserRoleSchema } from '@event-space/shared';
import type { UserRoleType } from '@event-space/shared';
import { readBoolean, readEnum, readNumber, readString, writeParam } from '@/hooks/urlFilters';

export const DEFAULT_PAGE_SIZE = 20;

export interface AdminUsersFilters {
	skip: number;
	limit: number;
	search?: string;
	role?: UserRoleType;
	emailVerified?: boolean;
	/** Registration date. */
	createdFrom?: string;
	createdTo?: string;
	isShadow?: boolean;
}

export function emptyUsersFilters(): AdminUsersFilters {
	return { skip: 0, limit: DEFAULT_PAGE_SIZE };
}

export function parseUsersFilters(params: URLSearchParams): AdminUsersFilters {
	return {
		skip: readNumber(params, 'skip') ?? 0,
		limit: readNumber(params, 'limit') ?? DEFAULT_PAGE_SIZE,
		search: readString(params, 'search'),
		role: readEnum(params, 'role', UserRoleSchema.options),
		emailVerified: readBoolean(params, 'emailVerified'),
		createdFrom: readString(params, 'createdFrom'),
		createdTo: readString(params, 'createdTo'),
		isShadow: readBoolean(params, 'isShadow'),
	};
}

export function serializeUsersFilters(
	params: URLSearchParams,
	filters: AdminUsersFilters,
): URLSearchParams {
	writeParam(params, 'skip', filters.skip > 0 ? filters.skip : undefined);
	writeParam(params, 'limit', filters.limit === DEFAULT_PAGE_SIZE ? undefined : filters.limit);
	writeParam(params, 'search', filters.search);
	writeParam(params, 'role', filters.role);
	writeParam(params, 'emailVerified', filters.emailVerified);
	writeParam(params, 'createdFrom', filters.createdFrom);
	writeParam(params, 'createdTo', filters.createdTo);
	writeParam(params, 'isShadow', filters.isShadow);
	return params;
}

export function countActiveUsersFilters(filters: AdminUsersFilters): number {
	const dateRangeApplied = filters.createdFrom || filters.createdTo ? 1 : 0;

	return (
		[filters.search, filters.role, filters.emailVerified, filters.isShadow].filter(
			(value) => value !== undefined,
		).length + dateRangeApplied
	);
}
