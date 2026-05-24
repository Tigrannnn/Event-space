import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

export interface CloudinaryUploadResult {
	url: string;
	publicId: string;
}

@Injectable()
export class UploadService {
	private readonly logger = new Logger(UploadService.name);

	uploadImage(file: Express.Multer.File): Promise<CloudinaryUploadResult> {
		if (!file) {
			throw new BadRequestException('No file provided');
		}

		return this.uploadBuffer(file.buffer);
	}

	uploadImages(files: Express.Multer.File[]): Promise<CloudinaryUploadResult[]> {
		if (!files?.length) {
			return Promise.resolve([]);
		}

		return Promise.all(files.map((file) => this.uploadImage(file)));
	}

	async deleteByPublicId(publicId: string): Promise<void> {
		if (!publicId) {
			throw new BadRequestException('publicId is required');
		}

		const result = await cloudinary.uploader.destroy(publicId);

		if (result.result !== 'ok' && result.result !== 'not found') {
			this.logger.warn(`Cloudinary delete unexpected result for ${publicId}: ${result.result}`);
		}
	}

	async deleteMultipleByPublicId(publicIds: string[]): Promise<void> {
		const uniqueIds = [...new Set(publicIds.filter(Boolean))];
		if (!uniqueIds.length) {
			return;
		}

		const results = await Promise.allSettled(
			uniqueIds.map((publicId) => this.deleteByPublicId(publicId)),
		);

		const failures = results.filter((r) => r.status === 'rejected');
		if (failures.length) {
			this.logger.error(`Failed to delete ${failures.length}/${uniqueIds.length} Cloudinary asset(s)`);
		}
	}

	private uploadBuffer(buffer: Buffer): Promise<CloudinaryUploadResult> {
		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: 'event-space',
					allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
					transformation: [
						{ width: 1200, crop: 'limit' },
						{ quality: 'auto', fetch_format: 'auto' },
					],
				},
				(error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
					if (error) {
						return reject(new BadRequestException(error.message));
					}
					if (!result?.secure_url || !result.public_id) {
						return reject(new BadRequestException('Upload failed: missing url or publicId'));
					}

					resolve({
						url: result.secure_url,
						publicId: result.public_id,
					});
				},
			);

			streamifier.createReadStream(buffer).pipe(uploadStream);
		});
	}
}
