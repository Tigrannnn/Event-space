import { BadRequestException } from '@nestjs/common';
import {
	CreateEventMultipartPayloadSchema,
	EventImageFileItem,
	EventImageItem,
	MAX_EVENT_IMAGE_FILE_SIZE_BYTES,
	MAX_EVENT_IMAGES,
	UpdateEventMultipartPayloadSchema,
	type CreateEventData,
	type UpdateEventData,
} from '@event-space/shared';
import { assertValidImageFile } from '@shared';

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
		throw new BadRequestException('payload.images is required');
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
		throw new BadRequestException('payload field is required');
	}

	try {
		return JSON.parse(payloadRaw) as unknown;
	} catch {
		throw new BadRequestException('payload must be valid JSON');
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
		throw new BadRequestException('Validation failed');
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
		throw new BadRequestException('Image orders must be unique');
	}

	const sorted = [...unique].sort((a, b) => a - b);
	if (sorted[0] !== 0 || sorted[sorted.length - 1] !== sorted.length - 1) {
		throw new BadRequestException('Image orders must be contiguous starting from 0');
	}
}

function assertFilesMatchImageItems(
	imageItems: Array<{ kind: string }>,
	files: Express.Multer.File[],
): void {
	const expectedFileCount = imageItems.filter((item) => item.kind === 'file').length;

	if (expectedFileCount !== files.length) {
		throw new BadRequestException(
			`Expected ${expectedFileCount} file(s) in files[], received ${files.length}`,
		);
	}
}

function assertWithinImageLimit(count: number): void {
	if (count > MAX_EVENT_IMAGES) {
		throw new BadRequestException(`Maximum ${MAX_EVENT_IMAGES} images allowed`);
	}
}

function validateImageFiles(files: Express.Multer.File[]): void {
	for (const file of files) {
		assertValidImageFile(file, { maxSizeBytes: MAX_EVENT_IMAGE_FILE_SIZE_BYTES });
	}
}
