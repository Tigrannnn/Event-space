import { Module } from '@nestjs/common';
import { UploadModule } from '@infra/upload/upload.module';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewAdminService } from './review-admin.service';
import { ReviewInviteService } from './review-invite.service';

@Module({
	imports: [UploadModule],
	controllers: [ReviewController],
	providers: [ReviewService, ReviewAdminService, ReviewInviteService],
	exports: [ReviewService, ReviewAdminService],
})
export class ReviewModule {}
