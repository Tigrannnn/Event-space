import type { Prisma } from '@prisma/client';
import type { CancellationPolicyRule } from '@event-space/shared';

export function mapOccurrenceForBookingResponse(
	occurrence: Prisma.EventOccurrenceGetPayload<{
		include: {
			event: {
				include: {
					images: true;
					cancellationRules: true;
					translations: true;
					category: { include: { translations: true } };
					occurrences: true;
				};
			};
		};
	}>,
) {
	return {
		...occurrence,
		event: mapEventForBookingResponse(occurrence.event),
	};
}

export function mapEventForBookingResponse(
	event: Prisma.EventGetPayload<{
		include: {
			images: true;
			cancellationRules: true;
			translations: true;
			category: { include: { translations: true } };
			occurrences: true;
		};
	}>,
) {
	return {
		...event,
		price: Number(event.price),
		images: event.images ?? [],
		cancellationRules: event.cancellationRules ?? [],
		translations: event.translations ?? [],
		category: event.category,
		occurrences: event.occurrences ?? [],
		locationUrl: event.locationUrl ?? null,
	};
}

export function calculateRefundPercentage(
	now: Date,
	eventDate: Date,
	rules: CancellationPolicyRule[],
): number {
	const msLeft = eventDate.getTime() - now.getTime();
	const hoursLeft = msLeft / (1000 * 60 * 60);

	if (hoursLeft <= 0) return 0;

	const sortedRules = [...rules].sort((a, b) => b.hoursBeforeEvent - a.hoursBeforeEvent);

	for (const rule of sortedRules) {
		if (hoursLeft >= rule.hoursBeforeEvent) {
			return rule.refundPercentage;
		}
	}

	return rules.length > 0 ? 0 : 100;
}

/**
 * Generates a new booking reference number using a dedicated database counter table.
 * This avoids raw sequence SQL in business logic and keeps the value sequential.
 * The raw value starts at 1; UI formatting pads it to at least 6 digits.
 */
export async function getNextBookingReference(tx: Prisma.TransactionClient): Promise<number> {
	const counter = await tx.bookingReference.create({ data: {} });
	return counter.id;
}
