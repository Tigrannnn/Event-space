import type { Prisma } from '@prisma/client';
import { AppException } from '@shared';
import { AppErrorCode } from '@event-space/shared';

interface SeatedOccurrence {
	id: string;
	maxParticipants: number;
	currentParticipants: number;
}

/**
 * Takes seats with a guarded update: the condition is part of the write, so two admins taking the
 * last seats at once cannot both succeed.
 */
export async function reserveSeats(
	tx: Prisma.TransactionClient,
	occurrence: SeatedOccurrence,
	quantity: number,
): Promise<void> {
	const reserved = await tx.eventOccurrence.updateMany({
		where: {
			id: occurrence.id,
			currentParticipants: { lte: occurrence.maxParticipants - quantity },
		},
		data: { currentParticipants: { increment: quantity } },
	});

	if (reserved.count > 0) return;

	const spotsLeft = Math.max(0, occurrence.maxParticipants - occurrence.currentParticipants);
	throw spotsLeft === 0
		? new AppException(AppErrorCode.NO_SPOTS_AVAILABLE)
		: new AppException(AppErrorCode.NOT_ENOUGH_SPOTS, { spotsLeft });
}

export async function releaseSeats(
	tx: Prisma.TransactionClient,
	occurrenceId: string,
	quantity: number,
): Promise<void> {
	const released = await tx.eventOccurrence.updateMany({
		where: { id: occurrenceId, currentParticipants: { gte: quantity } },
		data: { currentParticipants: { decrement: quantity } },
	});

	if (released.count === 0) {
		throw new AppException(AppErrorCode.UNABLE_TO_RELEASE_SPOTS);
	}
}
