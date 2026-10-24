import { BadRequestException } from '@nestjs/common';
import {
	AppErrorCode,
	CreateBannerSchema,
	MAX_BANNER_IMAGE_FILE_SIZE_BYTES,
	UpdateBannerSchema,
	type CreateBannerData,
	type UpdateBannerData,
} from '@event-space/shared';
import { AppException, assertValidImageFile } from '@shared';
import type { BannerImageFiles } from './banner-admin.service';

export type MultipartBannerFiles = {
	image?: Express.Multer.File[];
	imageMobile?: Express.Multer.File[];
};

export function parseCreateBannerMultipart(
	payloadRaw: string | undefined,
	files: MultipartBannerFiles | undefined,
): { data: CreateBannerData; files: BannerImageFiles } {
	return {
		data: parseWithSchema(CreateBannerSchema, parsePayloadJson(payloadRaw)),
		files: pickImageFiles(files),
	};
}

export function parseUpdateBannerMultipart(
	payloadRaw: string | undefined,
	files: MultipartBannerFiles | undefined,
): { data: UpdateBannerData; files: BannerImageFiles } {
	return {
		data: parseWithSchema(UpdateBannerSchema, parsePayloadJson(payloadRaw)),
		files: pickImageFiles(files),
	};
}

function pickImageFiles(files: MultipartBannerFiles | undefined): BannerImageFiles {
	const image = files?.image?.[0];
	const imageMobile = files?.imageMobile?.[0];

	for (const file of [image, imageMobile]) {
		if (file) {
			assertValidImageFile(file, { maxSizeBytes: MAX_BANNER_IMAGE_FILE_SIZE_BYTES });
		}
	}

	return { image, imageMobile };
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
			throw new BadRequestException({
				statusCode: 400,
				message: 'Validation failed',
				errors: error.issues.map((issue) => ({
					path: issue.path.join('.'),
					message: issue.message,
				})),
			});
		}
		throw new AppException(AppErrorCode.VALIDATION_FAILED);
	}
}

function isZodValidationError(
	error: unknown,
): error is { issues: Array<{ path: PropertyKey[]; message: string }> } {
	return (
		typeof error === 'object' && error !== null && 'issues' in error && Array.isArray(error.issues)
	);
}
