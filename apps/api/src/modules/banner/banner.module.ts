import { Module } from '@nestjs/common';
import { UploadModule } from '@infra/upload/upload.module';
import { RateLimiterModule } from '@infra/rate-limiter/rate-limiter.module';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';
import { BannerAdminService } from './banner-admin.service';

@Module({
	imports: [UploadModule, RateLimiterModule],
	controllers: [BannerController],
	providers: [BannerService, BannerAdminService],
	exports: [BannerService],
})
export class BannerModule {}
