import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CLOUDINARY_CONFIG, EnvKey } from '@event-space/shared';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { CloudinaryDeleteQueueService } from './cloudinary/delete-queue.service';

export interface CloudinaryUploadResult {
	url: string;
	publicId: string;
}

@Injectable()
export class UploadService implements OnModuleInit {
	private readonly logger = new Logger(UploadService.name);

	constructor(
		private readonly configService: ConfigService,
		private readonly deleteQueue: CloudinaryDeleteQueueService,
	) {}

	onModuleInit(): void {
		cloudinary.config({
			cloud_name: this.configService.getOrThrow<string>(EnvKey.CLOUDINARY_CLOUD_NAME),
			api_key: this.configService.getOrThrow<string>(EnvKey.CLOUDINARY_API_KEY),
			api_secret: this.configService.getOrThrow<string>(EnvKey.CLOUDINARY_API_SECRET),
		});
	}

	uploadImage(file: Express.Multer.File): Promise<CloudinaryUploadResult> {
		if (!file) {
			throw new BadRequestException('No file provided');
		}
		if (!file.buffer?.length) {
			throw new BadRequestException('File buffer is empty');
		}

		return this.uploadBuffer(file.buffer);
	}

	async uploadImages(files: Express.Multer.File[]): Promise<CloudinaryUploadResult[]> {
		if (!files?.length) {
			return [];
		}

		const results: CloudinaryUploadResult[] = [];

		try {
			for (const file of files) {
				results.push(await this.uploadImage(file));
			}
			return results;
		} catch (error) {
			await this.deleteMultipleByPublicId(results.map((r) => r.publicId));
			throw error;
		}
	}

	/**
	 * Attempts to delete a Cloudinary asset. Returns true when deleted or already absent.
	 */
	async tryDeletePublicId(publicId: string): Promise<boolean> {
		try {
			const result = await cloudinary.uploader.destroy(publicId);
			if (result.result === 'ok' || result.result === 'not found') {
				return true;
			}
			this.logger.warn(`Cloudinary delete unexpected result for ${publicId}: ${result.result}`);
			return false;
		} catch (error) {
			this.logger.warn(`Cloudinary delete failed for ${publicId}`, error);
			return false;
		}
	}

	async deleteByPublicId(publicId: string): Promise<void> {
		if (!publicId) {
			throw new BadRequestException('publicId is required');
		}

		const deleted = await this.tryDeletePublicId(publicId);
		if (!deleted) {
			await this.deleteQueue.enqueue(publicId);
		}
	}

	async deleteMultipleByPublicId(publicIds: string[]): Promise<void> {
		const uniqueIds = [...new Set(publicIds.filter(Boolean))];
		if (!uniqueIds.length) {
			return;
		}

		const failed: string[] = [];
		for (const publicId of uniqueIds) {
			const deleted = await this.tryDeletePublicId(publicId);
			if (!deleted) {
				failed.push(publicId);
			}
		}

		if (failed.length) {
			this.logger.error(
				`Failed to delete ${failed.length}/${uniqueIds.length} Cloudinary asset(s); queued for retry`,
			);
			await this.deleteQueue.enqueueMany(failed);
		}
	}

	private uploadBuffer(buffer: Buffer): Promise<CloudinaryUploadResult> {
		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: CLOUDINARY_CONFIG.UPLOAD_FOLDER,
					resource_type: 'image',
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
