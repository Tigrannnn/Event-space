/**
 * `YYYY-MM-DD` in the user's own timezone.
 *
 * `toISOString()` is deliberately avoided: it converts to UTC first, which shifts the date by a
 * day for anyone east or west of Greenwich around midnight.
 */
export function formatDateParam(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/** Reads a `YYYY-MM-DD` parameter back as a local date, or null if it is missing or malformed. */
export function parseDateParam(value: string | null): Date | null {
	if (!value) return null;

	const parsed = new Date(`${value}T00:00:00`);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}
