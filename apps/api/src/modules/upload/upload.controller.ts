import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

@Controller('upload')
export class UploadController {
	constructor(private readonly uploadService: UploadService) {}

	@Post('image')
	@UseGuards(AccessTokenGuard)
	@UseInterceptors(FileInterceptor('file'))
	async uploadImage(
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
					new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp|avif)' }),
				],
			})
		)
		file: Express.Multer.File
	) {
		const result = await this.uploadService.uploadImage(file);
		return { url: result.secure_url };
	}
}
