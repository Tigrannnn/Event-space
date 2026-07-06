export interface GuestCapacityOccurrenceLike {
	date: Date | string;
	currentParticipants?: number | null;
	maxParticipants?: number | null;
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
		(occurrence) => new Date(occurrence.date) > now,
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
