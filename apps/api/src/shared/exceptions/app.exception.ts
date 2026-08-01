import { HttpException } from '@nestjs/common';
import { AppErrorCode, type AppErrorParams } from '@event-space/shared';
import { ERROR_DEFINITIONS } from './error-definitions';

/**
 * An error identified by a stable code rather than by its text, so the web app can show
 * it in the user's language.
 *
 * The HTTP status and the English message come from {@link ERROR_DEFINITIONS}; call sites
 * only pick a code and, where the message needs them, some params:
 *
 * ```ts
 * throw new AppException(AppErrorCode.INVALID_CREDENTIALS);
 * throw new AppException(AppErrorCode.NOT_FOUND, { id: occurrenceId });
 * ```
 */
export class AppException extends HttpException {
	readonly code: AppErrorCode;
	readonly params?: AppErrorParams;

	constructor(code: AppErrorCode, params?: AppErrorParams) {
		const { status, message } = ERROR_DEFINITIONS[code];

		super({ code, message, ...(params && { params }) }, status);

		this.code = code;
		this.params = params;
	}
}
