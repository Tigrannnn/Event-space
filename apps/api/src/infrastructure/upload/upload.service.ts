import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppErrorCode, EnvKey } from '@event-space/shared';
import { AppException } from '@shared';
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
	private readonly folder: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly deleteQueue: CloudinaryDeleteQueueService,
	) {
		// Read here rather than in onModuleInit: the delete retry worker drains its queue
		// as soon as it initialises, which may be before this service's hook runs.
		this.folder = this.configService.getOrThrow<string>(EnvKey.CLOUDINARY_UPLOAD_FOLDER);
	}

	onModuleInit(): void {
		cloudinary.config({
			cloud_name: this.configService.getOrThrow<string>(EnvKey.CLOUDINARY_CLOUD_NAME),
			api_key: this.configService.getOrThrow<string>(EnvKey.CLOUDINARY_API_KEY),
			api_secret: this.configService.getOrThrow<string>(EnvKey.CLOUDINARY_API_SECRET),
		});
	}

	uploadImage(file: Express.Multer.File): Promise<CloudinaryUploadResult> {
		if (!file) {
			throw new AppException(AppErrorCode.NO_FILE_PROVIDED);
		}
		if (!file.buffer?.length) {
			throw new AppException(AppErrorCode.FILE_BUFFER_EMPTY);
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
		// A deployment deletes only from its own folder. Anything else — say, production ids
		// queued by a local copy before the folders were split — is dropped rather than
		// retried, which is why this reports success.
		if (!publicId.startsWith(`${this.folder}/`)) {
			this.logger.warn(`Refusing to delete ${publicId}: outside folder "${this.folder}"`);
			return true;
		}

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
			throw new AppException(AppErrorCode.PUBLIC_ID_REQUIRED);
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
					folder: this.folder,
					resource_type: 'image',
					allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
					transformation: [
						{ width: 1200, crop: 'limit' },
						{ quality: 'auto', fetch_format: 'auto' },
					],
				},
				(error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
					if (error) {
						this.logger.error('Cloudinary upload failed', error.message);
						return reject(new AppException(AppErrorCode.UPLOAD_FAILED));
					}
					if (!result?.secure_url || !result.public_id) {
						this.logger.error('Cloudinary upload succeeded but returned no url/publicId');
						return reject(new AppException(AppErrorCode.UPLOAD_FAILED));
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
