import { AppErrorCode } from '@event-space/shared';
import { AppException } from '@shared';
import type { Event, EventImageFileItem, EventImageItem, EventOccurrenceStatus, EventStatus } from '@event-space/shared';
import type { EventImage, Prisma } from '@prisma/client';
import type { UserRoleType } from '@event-space/shared';

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
	return [...items].sort((a, b) => a.order - b.order);
}

export function buildNewImageRows(
	eventId: string,
	imageItems: EventImageFileItem[],
	uploads: Awaited<ReturnType<any['uploadImages']>>,
): Prisma.EventImageCreateManyInput[] {
	return imageItems.map((item, index) => ({
		eventId,
		url: uploads[index].url,
		publicId: uploads[index].publicId,
		order: item.order,
	}));
}

export function validateExistingImageRefs(
	imageItems: EventImageItem[],
	existingImages: EventImage[],
) {
	const existingIds = new Set(existingImages.map((img) => img.id));
	const payloadExistingIds = imageItems
		.filter((item) => item.kind === 'existing')
		.map((item) => item.id);

	for (const id of payloadExistingIds) {
		if (!existingIds.has(id)) {
			throw new AppException(AppErrorCode.IMAGE_NOT_IN_EVENT, { id });
		}
	}

	const unique = new Set(payloadExistingIds);
	if (unique.size !== payloadExistingIds.length) {
		throw new AppException(AppErrorCode.DUPLICATE_IMAGE_IDS);
	}
}

export function findRemovedImages(existingImages: EventImage[], imageItems: EventImageItem[]) {
	const keptIds = new Set(
		imageItems.filter((item) => item.kind === 'existing').map((item) => item.id),
	);
	return existingImages.filter((img) => !keptIds.has(img.id));
}

export function assertCanModify(ownerId: string, userId: string, role: UserRoleType) {
	if (role !== 'ADMIN') {
		throw new AppException(AppErrorCode.INSUFFICIENT_PERMISSIONS);
	}
}
export function validateStatusTransition(oldStatus: EventStatus, newStatus: EventStatus): void {
	if (oldStatus === newStatus) return;

	const allowedTransitions: Record<EventStatus, EventStatus[]> = {
		DRAFT: ['PUBLISHED', 'CANCELLED'],
		PUBLISHED: ['CANCELLED'],
		CANCELLED: [],
	};

	if (!allowedTransitions[oldStatus].includes(newStatus)) {
		throw new AppException(AppErrorCode.INVALID_STATUS_TRANSITION, { from: oldStatus, to: newStatus });
	}
}

export interface GuestCapacityOccurrenceLike {
	date: Date | string;
	currentParticipants?: number | null;
	maxParticipants?: number | null;
    status: EventOccurrenceStatus;
}

export interface GuestCapacityEventLike {
	occurrences?: GuestCapacityOccurrenceLike[] | null;
}

/**
 * A party of N fits an event as soon as ONE bookable date has room for it — the
 * other dates being smaller says nothing about that one. Restricted to the same
 * window the date filter applies in SQL, so guests and dates narrow together:
 * a date with enough room outside the picked range must not rescue the event.
 */
export function eventMatchesGuestCapacity(
	event: GuestCapacityEventLike,
	guestCount: number,
	dateWindow?: OccurrenceDateWindow,
): boolean {
	if (!guestCount || guestCount <= 0) {
		return true;
	}

	const now = new Date();

	return (event.occurrences ?? []).some((occurrence) => {
		if (occurrence.status !== 'ACTIVE') return false;

		const date = new Date(occurrence.date);
		if (date <= now) return false;
		if (dateWindow?.from && date < dateWindow.from) return false;
		if (dateWindow?.to && date > dateWindow.to) return false;

		const currentParticipants = Number(occurrence.currentParticipants ?? 0);
		const maxParticipants = Number(occurrence.maxParticipants ?? 0);
		return Math.max(0, maxParticipants - currentParticipants) >= guestCount;
	});
}

/** Inclusive bounds of the `startDate`/`endDate` filter, as plain dates. */
export interface OccurrenceDateWindow {
	from?: Date;
	to?: Date;
}

/**
 * Parses the raw date params once, so the SQL filter below and the in-memory
 * guest filter above can never disagree about which dates are in range.
 */
export function buildOccurrenceDateWindow(startDate?: string, endDate?: string): OccurrenceDateWindow {
	return {
		...(startDate ? { from: new Date(`${startDate}T00:00:00.000`) } : {}),
		...(endDate ? { to: new Date(`${endDate}T23:59:59.999`) } : {}),
	};
}

export function buildOccurrenceDateFilter(startDate?: string, endDate?: string): Prisma.DateTimeFilter | undefined {
	const { from, to } = buildOccurrenceDateWindow(startDate, endDate);

	if (!from && !to) {
		return undefined;
	}

	return {
		...(from ? { gte: from } : {}),
		...(to ? { lte: to } : {}),
	};
}
