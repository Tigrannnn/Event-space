/**
 * Day boundaries shared by the dashboard queries.
 *
 * Local time rather than UTC: an admin asking for "March" means March as it looked from here, and
 * the charts label their points with the same local days. Mixing the two conventions would move
 * bookings made late in the evening into the next day on one widget but not on its neighbour.
 */
export function startOfDay(date: string): Date {
	return new Date(`${date}T00:00:00.000`);
}

export function endOfDay(date: string): Date {
	return new Date(`${date}T23:59:59.999`);
}

/** `YYYY-MM-DD` in local time — the key every dashboard series is plotted against. */
export function toDateKey(value: Date): string {
	const year = value.getFullYear();
	const month = String(value.getMonth() + 1).padStart(2, '0');
	const day = String(value.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
