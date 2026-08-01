import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { AppErrorCode } from '@event-space/shared';
import { AppException } from '../exceptions/app.exception';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
	constructor(private schema: { parse: (value: unknown) => unknown }) {}

	transform(value: unknown, _metadata: ArgumentMetadata) {
		try {
			return this.schema.parse(value);
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errors = error.issues.map((err) => ({
					path: err.path.join('.'),
					message: err.message,
				}));
				throw new BadRequestException({
					statusCode: 400,
					message: 'Validation failed',
					errors,
				});
			}
			throw new AppException(AppErrorCode.VALIDATION_FAILED);
		}
	}
}
