/**
 * Turns whatever a chart hands back for the x-axis value into a Date.
 *
 * Recharts types the tooltip label as `ReactNode`, so it is not guaranteed to arrive as the
 * `YYYY-MM-DD` string the data holds. Blindly appending a time to it produces an Invalid Date,
 * and the date formatters return an empty string for those — which is why a malformed label
 * shows up as a missing line rather than as visible nonsense.
 */
export function toChartDate(value: unknown): Date | null {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : value;
	}

	if (typeof value === 'number') {
		const fromTimestamp = new Date(value);
		return Number.isNaN(fromTimestamp.getTime()) ? null : fromTimestamp;
	}

	if (typeof value !== 'string' || value.trim() === '') {
		return null;
	}

	// A plain calendar day is pinned to local midnight; anything else is left to Date to parse.
	// Without the explicit time, `YYYY-MM-DD` is read as UTC and shifts a day for western zones.
	const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
		? new Date(`${value}T00:00:00`)
		: new Date(value);

	return Number.isNaN(parsed.getTime()) ? null : parsed;
}
