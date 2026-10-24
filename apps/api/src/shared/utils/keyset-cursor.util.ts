/**
 * A page bound for "newest first" lists: the creation time of the last row sent, plus its id.
 *
 * `createdAt` alone cannot carry a cursor — two rows can share a millisecond, and one of them
 * would be skipped or sent twice. The id makes the order total. `updatedAt` cannot carry one
 * either: a row that changes moves within the order, under the feet of someone mid-scroll.
 */
export interface KeysetCursor {
	createdAt: Date;
	id: string;
}

export function encodeKeysetCursor(row: KeysetCursor): string {
	return `${row.createdAt.toISOString()}_${row.id}`;
}

/** A malformed or truncated cursor is treated as no cursor: the list restarts from the top. */
export function decodeKeysetCursor(cursor?: string): KeysetCursor | null {
	if (!cursor) return null;

	// The id is a uuid and the timestamp an ISO string; neither holds an underscore, so the
	// last one separates them.
	const separator = cursor.lastIndexOf('_');
	if (separator <= 0) return null;

	const createdAt = new Date(cursor.slice(0, separator));
	const id = cursor.slice(separator + 1);

	return id && !Number.isNaN(createdAt.getTime()) ? { createdAt, id } : null;
}

/**
 * The "everything after the cursor" half of a where clause, for a list ordered by
 * `createdAt desc, id desc`. Returns nothing for the first page.
 */
export function keysetAfter(cursor?: string): {
	OR: [{ createdAt: { lt: Date } }, { createdAt: Date; id: { lt: string } }];
} | null {
	const decoded = decodeKeysetCursor(cursor);

	if (!decoded) return null;

	return {
		OR: [
			{ createdAt: { lt: decoded.createdAt } },
			{ createdAt: decoded.createdAt, id: { lt: decoded.id } },
		],
	};
}

/** Newest first, with the id as a tie-break. Must match the clause `keysetAfter` builds. */
export const KEYSET_ORDER = [{ createdAt: 'desc' as const }, { id: 'desc' as const }];
