import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
	uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
		if (!file) {
			throw new BadRequestException('No file provided');
		}

		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: 'event-space',
					allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
					transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }],
				},
				(error: UploadApiErrorResponse, result: UploadApiResponse) => {
					if (error) return reject(new BadRequestException(error.message));
					resolve(result);
				}
			);

			streamifier.createReadStream(file.buffer).pipe(uploadStream);
		});
	}
}
