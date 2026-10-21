import type { Prisma } from '@prisma/client';
import { isUuid } from '@event-space/shared';
import type {
	BookingAuthor,
	BookingDisplayStatus,
	PaymentMethod,
	TimeFilterType,
} from '@event-space/shared';
import { buildDayRangeFilter } from '../common/query-helpers';

export interface BookingFilters {
	search?: string;
	status?: BookingDisplayStatus;
	time?: TimeFilterType;
	eventId?: string;
	occurrenceId?: string;
	createdFrom?: string;
	createdTo?: string;
	/** Date of the tour itself, not of the booking. */
	tourFrom?: string;
	tourTo?: string;
	paymentMethod?: PaymentMethod;
	createdBy?: BookingAuthor;
}

/** The columns a display status stands for — see BookingDisplayStatusEnum. */
export function bookingDisplayStatusWhere(status?: BookingDisplayStatus): Prisma.BookingWhereInput {
	switch (status) {
		case undefined:
			return {};
		case 'CHECKED_IN':
			return { status: 'CONFIRMED', checkedInAt: { not: null } };
		case 'CONFIRMED':
			return { status: 'CONFIRMED', checkedInAt: null };
		default:
			return { status };
	}
}

export function buildBookingsWhere(filters: BookingFilters, now: Date) {
	const { search, status, time, eventId, occurrenceId, createdFrom, createdTo } = filters;
	const { tourFrom, tourTo, paymentMethod, createdBy } = filters;

	const createdAt = buildDayRangeFilter(createdFrom, createdTo);
	const tourDate = buildDayRangeFilter(tourFrom, tourTo);

	// `time`, the tour date range and `eventId` all constrain the related occurrence, so they
	// have to be merged into a single condition — spreading them as separate `occurrence` keys
	// would leave only the last one standing. The two date conditions go through AND for the
	// same reason: both set `date`, and "upcoming" plus a range must honour both bounds.
	const occurrenceDates = [
		...(time === 'upcoming' ? [{ date: { gte: now } }] : []),
		...(time === 'completed' ? [{ date: { lt: now } }] : []),
		...(tourDate ? [{ date: tourDate }] : []),
	];
	const occurrence = {
		...(occurrenceDates.length > 0 ? { AND: occurrenceDates } : {}),
		...(eventId ? { eventId } : {}),
	};

	return {
		...(search
			? {
					OR: [
						...(isUuid(search) ? [{ id: search }] : []),
						{ user: { name: { contains: search, mode: 'insensitive' as const } } },
						{ user: { email: { contains: search, mode: 'insensitive' as const } } },
						{
							event: {
								translations: {
									some: {
										OR: [
											{ title: { contains: search, mode: 'insensitive' as const } },
											{ location: { contains: search, mode: 'insensitive' as const } },
										],
									},
								},
							},
						},
					],
				}
			: {}),
		...bookingDisplayStatusWhere(status),
		...(occurrenceId ? { occurrenceId } : {}),
		...(Object.keys(occurrence).length > 0 ? { occurrence } : {}),
		...(paymentMethod ? { paymentMethod } : {}),
		...(createdAt ? { createdAt } : {}),
		...(createdBy ? { createdByAdminId: createdBy === 'admin' ? { not: null } : null } : {}),
	};
}
