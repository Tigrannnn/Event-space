import { BadRequestException } from '@nestjs/common';

export type DetectedImageFormat = 'jpeg' | 'png' | 'webp' | 'avif';

const EXT_BY_FORMAT: Record<DetectedImageFormat, RegExp> = {
	jpeg: /\.(jpe?g)$/i,
	png: /\.png$/i,
	webp: /\.webp$/i,
	avif: /\.avif$/i,
};

export function detectImageFormat(buffer: Buffer): DetectedImageFormat | null {
	if (buffer.length < 12) {
		return null;
	}

	if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
		return 'jpeg';
	}

	if (
		buffer.length >= 8 &&
		buffer[0] === 0x89 &&
		buffer[1] === 0x50 &&
		buffer[2] === 0x4e &&
		buffer[3] === 0x47
	) {
		return 'png';
	}

	if (
		buffer.toString('ascii', 0, 4) === 'RIFF' &&
		buffer.toString('ascii', 8, 12) === 'WEBP'
	) {
		return 'webp';
	}

	if (buffer.toString('ascii', 4, 8) === 'ftyp') {
		const brand = buffer.toString('ascii', 8, 12);
		if (brand === 'avif' || brand === 'avis' || brand.startsWith('mif')) {
			return 'avif';
		}
	}

	return null;
}

export function assertValidImageFile(
	file: Express.Multer.File,
	options: { maxSizeBytes: number },
): void {
	if (!file.buffer?.length) {
		throw new BadRequestException(`File ${file.originalname} is empty or unreadable`);
	}

	if (file.size > options.maxSizeBytes) {
		throw new BadRequestException(`File ${file.originalname} exceeds 5MB limit`);
	}

	const mimeOk = Boolean(file.mimetype && /^image\/(png|jpe?g|webp|avif)$/i.test(file.mimetype));
	const extOk = /\.(png|jpe?g|webp|avif)$/i.test(file.originalname);

	if (!mimeOk || !extOk) {
		throw new BadRequestException(
			`File ${file.originalname} must be a valid png, jpeg, jpg, webp, or avif image`,
		);
	}

	const detected = detectImageFormat(file.buffer);
	if (!detected) {
		throw new BadRequestException(`File ${file.originalname} is not a valid image`);
	}

	if (!EXT_BY_FORMAT[detected].test(file.originalname)) {
		throw new BadRequestException(
			`File ${file.originalname} extension does not match image content (${detected})`,
		);
	}
}
