import { AxiosError } from 'axios';
import {
	AppErrorCode,
	appErrorCodeForStatus,
	isAppErrorCode,
	type AppErrorParams,
} from '../enums/error-code.enum';

export interface ApiErrorData {
	message: string;
	code?: string;
	params?: AppErrorParams;
}

export interface ResolvedApiError {
	code: AppErrorCode;
	params?: AppErrorParams;
}

/**
 * The code identifying an error, for translation on the client.
 *
 * Always resolves to something: responses from an endpoint that has not been migrated to
 * a domain code fall back to a code derived from the HTTP status, and failures with no
 * response at all (network down, request cancelled) to `INTERNAL_ERROR`.
 */
export function resolveApiError(error: unknown): ResolvedApiError {
	if (!(error instanceof AxiosError)) {
		return { code: AppErrorCode.INTERNAL_ERROR };
	}

	const data = error.response?.data as ApiErrorData | undefined;

	if (isAppErrorCode(data?.code)) {
		return { code: data.code, params: data.params };
	}

	return { code: appErrorCodeForStatus(error.response?.status) };
}
