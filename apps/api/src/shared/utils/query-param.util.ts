import {
	AppErrorCode,
	DateOnlySchema,
	EventDifficulty,
	EventDifficultyEnum,
} from '@event-space/shared';
import { AppException } from '../exceptions/app.exception';

export function parseOptionalQueryInt(value?: string, fieldName = 'value'): number | undefined {
	if (value === undefined || value === '') {
		return undefined;
	}

	const parsed = Number(value);
	if (!Number.isFinite(parsed)) {
		throw new AppException(AppErrorCode.INVALID_QUERY_PARAM, { field: fieldName });
	}

	return parsed;
}

/**
 * Reads a comma-separated list of difficulties ("EASY,HARD"), as the catalogue filter sends it.
 *
 * An unknown value is a client mistake, not a reason to return the whole catalogue unfiltered,
 * so it is rejected rather than dropped.
 */
export function parseOptionalQueryDifficulties(value?: string): EventDifficulty[] | undefined {
	if (value === undefined || value === '') {
		return undefined;
	}

	const parsed = value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean)
		.map((item) => {
			const result = EventDifficultyEnum.safeParse(item);
			if (!result.success) {
				throw new AppException(AppErrorCode.INVALID_QUERY_PARAM, { field: 'difficulty' });
			}
			return result.data;
		});

	return parsed.length > 0 ? parsed : undefined;
}

/**
 * Reads a tri-state flag from the query string: `true`, `false`, or absent.
 *
 * Anything else is treated as absent rather than as `false`, so a malformed value widens the
 * result instead of silently filtering rows out.
 */
export function parseOptionalQueryBoolean(value?: string): boolean | undefined {
	if (value === 'true') return true;
	if (value === 'false') return false;
	return undefined;
}

/**
 * Validates a `YYYY-MM-DD` query parameter, returning it unchanged.
 *
 * The value stays a string: the service widens a calendar day into its full time range, and
 * parsing to a `Date` here would pin it to midnight and silently drop everything later that day.
 */
export function parseOptionalQueryDate(value?: string, fieldName = 'date'): string | undefined {
	if (value === undefined || value === '') {
		return undefined;
	}

	const result = DateOnlySchema.safeParse(value);
	if (!result.success || Number.isNaN(new Date(`${value}T00:00:00.000`).getTime())) {
		throw new AppException(AppErrorCode.INVALID_QUERY_PARAM, { field: fieldName });
	}

	return result.data;
}
