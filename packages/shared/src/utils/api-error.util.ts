import { AxiosError } from 'axios';

export interface ApiErrorData {
	message: string;
}

export function isAxiosApiError(error: unknown): error is AxiosError<ApiErrorData> {
	return error instanceof AxiosError && !!error.response?.data?.message;
}

export function getApiErrorMessage(error: unknown, fallback?: string): string {
	fallback = fallback || 'An unexpected error occurred';
	if (isAxiosApiError(error)) {
		return error.response?.data?.message || fallback;
	}
	return fallback;
}
