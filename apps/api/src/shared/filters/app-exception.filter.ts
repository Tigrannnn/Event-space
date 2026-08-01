import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AppErrorCode, appErrorCodeForStatus } from '@event-space/shared';
import { AppException } from '../exceptions/app.exception';

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Attaches an {@link AppErrorCode} to every error response, so the web app can show a
 * message in the user's language instead of the English text carried in `message`.
 *
 * Exceptions that have not been migrated to {@link AppException} still get a code, derived
 * from their HTTP status — coarse, but translated.
 */
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(AppExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const response = host.switchToHttp().getResponse<Response>();

		if (exception instanceof AppException) {
			const status = exception.getStatus();
			response.status(status).json({ statusCode: status, ...(exception.getResponse() as object) });
			return;
		}

		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const body = exception.getResponse();

			/**
			 * Field-level validation errors are thrown as a BadRequestException carrying an
			 * `errors` array (see ZodValidationPipe and the event multipart mapper). Forms
			 * highlight individual fields from that array, so the body is passed through
			 * untouched and only annotated with a code.
			 */
			if (isPlainObject(body) && Array.isArray(body.errors)) {
				response
					.status(status)
					.json({ ...body, statusCode: status, code: AppErrorCode.VALIDATION_FAILED });
				return;
			}

			response.status(status).json({
				statusCode: status,
				code: appErrorCodeForStatus(status),
				message: isPlainObject(body) ? body.message : body,
			});
			return;
		}

		// Nothing below is a deliberate error, so the details stay in the log rather than
		// travelling to the client.
		this.logger.error(
			'Unhandled exception',
			exception instanceof Error ? exception.stack : String(exception),
		);

		response.status(500).json({
			statusCode: 500,
			code: AppErrorCode.INTERNAL_ERROR,
			message: 'Internal server error',
		});
	}
}
