import { BadRequestException } from '@nestjs/common';
import {
	AppErrorCode,
	CreateEventMultipartPayloadSchema,
	EventImageFileItem,
	EventImageItem,
	MAX_EVENT_IMAGE_FILE_SIZE_BYTES,
	MAX_EVENT_IMAGES,
	UpdateEventMultipartPayloadSchema,
	type CreateEventData,
	type UpdateEventData,
} from '@event-space/shared';
import { AppException, assertValidImageFile } from '@shared';

export type ParsedCreateEventMultipart = {
	eventData: CreateEventData;
	imageItems: EventImageFileItem[];
	files: Express.Multer.File[];
};

export type ParsedUpdateEventMultipart = {
	eventData: UpdateEventData;
	imageItems: EventImageItem[];
	files: Express.Multer.File[];
};

export function parseCreateEventMultipart(
	payloadRaw: string | undefined,
	files: Express.Multer.File[] | undefined,
): ParsedCreateEventMultipart {
	const payload = parsePayloadJson(payloadRaw);
	const { images, ...eventFields } = parseWithSchema(
		CreateEventMultipartPayloadSchema,
		payload,
	);

	const imageItems = images ?? [];
	const normalizedFiles = files ?? [];

	validateImageOrders(imageItems);
	assertFilesMatchImageItems(imageItems, normalizedFiles);
	validateImageFiles(normalizedFiles);
	assertWithinImageLimit(imageItems.length);

	return {
		eventData: eventFields as CreateEventData,
		imageItems,
		files: normalizedFiles,
	};
}

export function parseUpdateEventMultipart(
	payloadRaw: string | undefined,
	files: Express.Multer.File[] | undefined,
): ParsedUpdateEventMultipart {
	const payload = parsePayloadJson(payloadRaw);
	const { images, ...eventFields } = parseWithSchema(
		UpdateEventMultipartPayloadSchema,
		payload,
	);

	if (!images) {
		throw new AppException(AppErrorCode.IMAGES_REQUIRED);
	}

	const normalizedFiles = files ?? [];

	validateImageOrders(images);
	assertFilesMatchImageItems(images, normalizedFiles);
	validateImageFiles(normalizedFiles);
	assertWithinImageLimit(images.length);

	return {
		eventData: eventFields as UpdateEventData,
		imageItems: images,
		files: normalizedFiles,
	};
}

function parsePayloadJson(payloadRaw: string | undefined): unknown {
	if (!payloadRaw?.trim()) {
		throw new AppException(AppErrorCode.PAYLOAD_REQUIRED);
	}

	try {
		return JSON.parse(payloadRaw) as unknown;
	} catch {
		throw new AppException(AppErrorCode.INVALID_JSON_PAYLOAD);
	}
}

function parseWithSchema<T>(schema: { parse: (payload: unknown) => T }, payload: unknown): T {
	try {
		return schema.parse(payload);
	} catch (error) {
		if (isZodValidationError(error)) {
			const errors = error.issues.map((issue) => ({
				path: issue.path.join('.'),
				message: issue.message,
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

function isZodValidationError(
	error: unknown,
): error is { issues: Array<{ path: PropertyKey[]; message: string }> } {
	return (
		typeof error === 'object' &&
		error !== null &&
		'issues' in error &&
		Array.isArray((error as { issues: unknown }).issues)
	);
}

function validateImageOrders(items: { order: number }[]): void {
	if (!items.length) {
		return;
	}

	const orders = items.map((item) => item.order);
	const unique = new Set(orders);

	if (unique.size !== orders.length) {
		throw new AppException(AppErrorCode.DUPLICATE_IMAGE_ORDERS);
	}

	const sorted = [...unique].sort((a, b) => a - b);
	if (sorted[0] !== 0 || sorted[sorted.length - 1] !== sorted.length - 1) {
		throw new AppException(AppErrorCode.NON_CONTIGUOUS_IMAGE_ORDERS);
	}
}

function assertFilesMatchImageItems(
	imageItems: Array<{ kind: string }>,
	files: Express.Multer.File[],
): void {
	const expectedFileCount = imageItems.filter((item) => item.kind === 'file').length;

	if (expectedFileCount !== files.length) {
		throw new AppException(AppErrorCode.FILE_COUNT_MISMATCH, {
			expected: expectedFileCount,
			received: files.length,
		});
	}
}

function assertWithinImageLimit(count: number): void {
	if (count > MAX_EVENT_IMAGES) {
		throw new AppException(AppErrorCode.TOO_MANY_IMAGES, { max: MAX_EVENT_IMAGES });
	}
}

function validateImageFiles(files: Express.Multer.File[]): void {
	for (const file of files) {
		assertValidImageFile(file, { maxSizeBytes: MAX_EVENT_IMAGE_FILE_SIZE_BYTES });
	}
}
