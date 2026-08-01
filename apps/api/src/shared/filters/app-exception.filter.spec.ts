import { ArgumentsHost, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { AppErrorCode } from '@event-space/shared';
import { AppExceptionFilter } from './app-exception.filter';
import { AppException } from '../exceptions/app.exception';

function createHost() {
	const json = jest.fn();
	const status = jest.fn().mockReturnValue({ json });
	const host = {
		switchToHttp: () => ({ getResponse: () => ({ status }) }),
	} as unknown as ArgumentsHost;

	return { host, status, json };
}

describe('AppExceptionFilter', () => {
	let filter: AppExceptionFilter;

	beforeEach(() => {
		filter = new AppExceptionFilter();
	});

	it('sends the code and status of an AppException', () => {
		const { host, status, json } = createHost();

		filter.catch(new AppException(AppErrorCode.INVALID_CREDENTIALS), host);

		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith(
			expect.objectContaining({ statusCode: 401, code: AppErrorCode.INVALID_CREDENTIALS }),
		);
	});

	it('passes params through for interpolation', () => {
		const { host, json } = createHost();

		filter.catch(new AppException(AppErrorCode.NOT_FOUND, { id: 'abc' }), host);

		expect(json).toHaveBeenCalledWith(expect.objectContaining({ params: { id: 'abc' } }));
	});

	/**
	 * Forms highlight individual fields from `errors`. Dropping it while adding a code would
	 * break that silently, since the toast would still show a sensible message.
	 */
	it('preserves the errors array of a validation failure', () => {
		const { host, status, json } = createHost();
		const errors = [{ path: 'email', message: 'Invalid email' }];

		filter.catch(new BadRequestException({ statusCode: 400, message: 'Validation failed', errors }), host);

		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({
			statusCode: 400,
			message: 'Validation failed',
			errors,
			code: AppErrorCode.VALIDATION_FAILED,
		});
	});

	it('derives a code from the status of an exception that has none', () => {
		const { host, json } = createHost();

		filter.catch(new NotFoundException('Occurrence not found'), host);

		expect(json).toHaveBeenCalledWith(
			expect.objectContaining({ statusCode: 404, code: AppErrorCode.NOT_FOUND }),
		);
	});

	it.each([
		[new BadRequestException('nope'), 400, AppErrorCode.BAD_REQUEST],
		[new ConflictException('nope'), 409, AppErrorCode.CONFLICT],
	])('maps status %# to its generic code', (exception, expectedStatus, expectedCode) => {
		const { host, json } = createHost();

		filter.catch(exception, host);

		expect(json).toHaveBeenCalledWith(
			expect.objectContaining({ statusCode: expectedStatus, code: expectedCode }),
		);
	});

	it('hides the details of an unexpected error behind a 500', () => {
		const { host, status, json } = createHost();
		jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

		filter.catch(new Error('connection string: postgres://user:secret@host'), host);

		expect(status).toHaveBeenCalledWith(500);
		expect(json).toHaveBeenCalledWith({
			statusCode: 500,
			code: AppErrorCode.INTERNAL_ERROR,
			message: 'Internal server error',
		});
		expect(JSON.stringify(json.mock.calls)).not.toContain('secret');
	});
});
