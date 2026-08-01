import { AppErrorCode } from '@event-space/shared';
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
