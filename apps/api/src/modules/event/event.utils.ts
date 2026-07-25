import { BadRequestException, ForbiddenException } from '@nestjs/common';
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
			throw new BadRequestException(`Event image ${id} does not belong to this event`);
		}
	}

	const unique = new Set(payloadExistingIds);
	if (unique.size !== payloadExistingIds.length) {
		throw new BadRequestException('Duplicate existing image ids in payload');
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
		throw new ForbiddenException('You do not have permission to modify this event');
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
		throw new BadRequestException(`Cannot change status from ${oldStatus} to ${newStatus}`);
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

export function eventMatchesGuestCapacity(
	event: GuestCapacityEventLike,
	guestCount: number,
): boolean {
	if (!guestCount || guestCount <= 0) {
		return true;
	}

	const now = new Date();
	const futureOccurrences = (event.occurrences ?? []).filter(
		(occurrence) => new Date(occurrence.date) > now && occurrence.status === 'ACTIVE',
	);

	if (futureOccurrences.length === 0) {
		return false;
	}

	const minFreeSpots = futureOccurrences.reduce((min, occurrence) => {
		const currentParticipants = Number(occurrence.currentParticipants ?? 0);
		const maxParticipants = Number(occurrence.maxParticipants ?? 0);
		const freeSpots = Math.max(0, maxParticipants - currentParticipants);
		return Math.min(min, freeSpots);
	}, Number.POSITIVE_INFINITY);

	return minFreeSpots >= guestCount;
}

export function buildOccurrenceDateFilter(startDate?: string, endDate?: string): Prisma.DateTimeFilter | undefined {
	if (!startDate && !endDate) {
		return undefined;
	}

	const filter: Prisma.DateTimeFilter = {};

	if (startDate) {
		filter.gte = new Date(`${startDate}T00:00:00.000`);
	}

	if (endDate) {
		filter.lte = new Date(`${endDate}T23:59:59.999`);
	}

	return filter;
}
