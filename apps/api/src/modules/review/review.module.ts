import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewAdminService } from './review-admin.service';
import { ReviewInviteService } from './review-invite.service';

@Module({
	controllers: [ReviewController],
	providers: [ReviewService, ReviewAdminService, ReviewInviteService],
	exports: [ReviewService, ReviewAdminService],
})
export class ReviewModule {}
