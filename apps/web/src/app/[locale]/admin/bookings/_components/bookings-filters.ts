import { BookingStatusEnum, PaymentMethodEnum, TimeFilterSchema } from '@event-space/shared';
import type { BookingStatus, PaymentMethod, TimeFilterType } from '@event-space/shared';
import { readEnum, readNumber, readString, writeParam } from '@/hooks/urlFilters';

export const DEFAULT_PAGE_SIZE = 20;

export interface AdminBookingsFilters {
	skip: number;
	limit: number;
	search?: string;
	status?: BookingStatus;
	/** Date of the event. */
	time?: TimeFilterType;
	eventId?: string;
	/** Date the booking was made — a different question from `time`. */
	createdFrom?: string;
	createdTo?: string;
	paymentMethod?: PaymentMethod;
}

export function emptyBookingsFilters(): AdminBookingsFilters {
	return { skip: 0, limit: DEFAULT_PAGE_SIZE };
}

export function parseBookingsFilters(params: URLSearchParams): AdminBookingsFilters {
	return {
		skip: readNumber(params, 'skip') ?? 0,
		limit: readNumber(params, 'limit') ?? DEFAULT_PAGE_SIZE,
		search: readString(params, 'search'),
		status: readEnum(params, 'status', BookingStatusEnum.options),
		time: readEnum(params, 'time', TimeFilterSchema.options),
		eventId: readString(params, 'eventId'),
		createdFrom: readString(params, 'createdFrom'),
		createdTo: readString(params, 'createdTo'),
		paymentMethod: readEnum(params, 'paymentMethod', PaymentMethodEnum.options),
	};
}

export function serializeBookingsFilters(
	params: URLSearchParams,
	filters: AdminBookingsFilters,
): URLSearchParams {
	writeParam(params, 'skip', filters.skip > 0 ? filters.skip : undefined);
	writeParam(params, 'limit', filters.limit === DEFAULT_PAGE_SIZE ? undefined : filters.limit);
	writeParam(params, 'search', filters.search);
	writeParam(params, 'status', filters.status);
	writeParam(params, 'time', filters.time);
	writeParam(params, 'eventId', filters.eventId);
	writeParam(params, 'createdFrom', filters.createdFrom);
	writeParam(params, 'createdTo', filters.createdTo);
	writeParam(params, 'paymentMethod', filters.paymentMethod);
	return params;
}

export function countActiveBookingsFilters(filters: AdminBookingsFilters): number {
	const dateRangeApplied = filters.createdFrom || filters.createdTo ? 1 : 0;

	return (
		[filters.search, filters.status, filters.time, filters.eventId, filters.paymentMethod].filter(
			(value) => value !== undefined,
		).length + dateRangeApplied
	);
}
