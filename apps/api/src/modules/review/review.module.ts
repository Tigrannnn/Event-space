import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewAdminService } from './review-admin.service';

@Module({
	controllers: [ReviewController],
	providers: [ReviewService, ReviewAdminService],
	exports: [ReviewService, ReviewAdminService],
})
export class ReviewModule {}
