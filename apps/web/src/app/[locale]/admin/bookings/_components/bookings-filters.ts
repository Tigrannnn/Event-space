import { BookingDisplayStatusEnum, PaymentMethodEnum, TimeFilterSchema } from '@event-space/shared';
import type { BookingDisplayStatus, PaymentMethod, TimeFilterType } from '@event-space/shared';
import { readEnum, readNumber, readString, writeParam } from '@/hooks/urlFilters';

export const DEFAULT_PAGE_SIZE = 20;

export interface AdminBookingsFilters {
	skip: number;
	limit: number;
	search?: string;
	status?: BookingDisplayStatus;
	/** Date of the event. */
	time?: TimeFilterType;
	eventId?: string;
	occurrenceId?: string;
	/** Date the booking was made — a different question from `time`. */
	createdFrom?: string;
	createdTo?: string;
	/** Date of the tour, as an exact range — `time` only splits upcoming from completed. */
	tourFrom?: string;
	tourTo?: string;
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
		status: readEnum(params, 'status', BookingDisplayStatusEnum.options),
		time: readEnum(params, 'time', TimeFilterSchema.options),
		eventId: readString(params, 'eventId'),
		occurrenceId: readString(params, 'occurrenceId'),
		createdFrom: readString(params, 'createdFrom'),
		createdTo: readString(params, 'createdTo'),
		tourFrom: readString(params, 'tourFrom'),
		tourTo: readString(params, 'tourTo'),
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
	writeParam(params, 'occurrenceId', filters.occurrenceId);
	writeParam(params, 'createdFrom', filters.createdFrom);
	writeParam(params, 'createdTo', filters.createdTo);
	writeParam(params, 'tourFrom', filters.tourFrom);
	writeParam(params, 'tourTo', filters.tourTo);
	writeParam(params, 'paymentMethod', filters.paymentMethod);
	return params;
}

export function countActiveBookingsFilters(filters: AdminBookingsFilters): number {
	const dateRangeApplied = filters.createdFrom || filters.createdTo ? 1 : 0;
	const tourRangeApplied = filters.tourFrom || filters.tourTo ? 1 : 0;

	return (
		[
			filters.search,
			filters.status,
			filters.time,
			filters.eventId,
			filters.occurrenceId,
			filters.paymentMethod,
		].filter(
			(value) => value !== undefined,
		).length +
		dateRangeApplied +
		tourRangeApplied
	);
}
