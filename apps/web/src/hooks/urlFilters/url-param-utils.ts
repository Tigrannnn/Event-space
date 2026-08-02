/**
 * Readers for query-string values.
 *
 * All of them treat a malformed value as absent rather than as a valid filter. A hand-edited or
 * stale URL then shows an unfiltered list, which is obvious, instead of an empty one, which
 * looks like missing data.
 */

export function readString(params: URLSearchParams, key: string): string | undefined {
	const value = params.get(key)?.trim();
	return value ? value : undefined;
}

export function readNumber(params: URLSearchParams, key: string): number | undefined {
	const raw = params.get(key);
	if (!raw) return undefined;

	const parsed = Number(raw);
	return Number.isFinite(parsed) ? parsed : undefined;
}

export function readEnum<T extends string>(
	params: URLSearchParams,
	key: string,
	allowed: readonly T[],
): T | undefined {
	const raw = params.get(key);
	return raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : undefined;
}

export function readBoolean(params: URLSearchParams, key: string): boolean | undefined {
	const raw = params.get(key);
	if (raw === 'true') return true;
	if (raw === 'false') return false;
	return undefined;
}

/** Sets a parameter, or removes it when the value is empty — so cleared filters leave no trace. */
export function writeParam(
	params: URLSearchParams,
	key: string,
	value: string | number | boolean | undefined | null,
): void {
	if (value === undefined || value === null || value === '') {
		params.delete(key);
		return;
	}

	params.set(key, String(value));
}
