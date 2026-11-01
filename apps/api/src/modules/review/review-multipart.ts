import { AppErrorCode } from '@event-space/shared';
import { AppException, ZodValidationPipe } from '@shared';

/**
 * A review arrives either as plain JSON or, when it carries photos, as a form whose `payload`
 * field holds that same JSON. Both are checked against the same schema.
 */
export function parseReviewBody<T>(schema: { parse: (value: unknown) => T }, body: unknown): T {
	let raw = body;

	if (body && typeof body === 'object' && 'payload' in body) {
		const payload = (body as { payload: unknown }).payload;
		if (typeof payload !== 'string') throw new AppException(AppErrorCode.VALIDATION_FAILED);

		try {
			raw = JSON.parse(payload);
		} catch {
			throw new AppException(AppErrorCode.VALIDATION_FAILED);
		}
	}

	return new ZodValidationPipe(schema).transform(raw, { type: 'body' }) as T;
}
