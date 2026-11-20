import { Body, Controller, Headers, HttpCode, Ip, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';
import { getReference } from '@infra/swagger/swagger.utils';
import { TrackAnalyticsSchema, type TrackAnalyticsData } from '@event-space/shared';
import { ANALYTICS_CONFIG } from '@event-space/shared/constants';
import { ZodValidationPipe } from '@shared';
import { OptionalAccessTokenGuard } from '@modules/auth/guards/optional-access-token.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
	constructor(
		private readonly analytics: AnalyticsService,
		private readonly rateLimiter: RateLimiterService,
	) {}

	@Post('track')
	@HttpCode(200)
	@UseGuards(OptionalAccessTokenGuard)
	@ApiOperation({ summary: 'Count a visit, a tour view or a booking start, once per visitor a day' })
	@ApiBody(getReference('TrackAnalyticsSchema'))
	async track(
		@Ip() ip: string,
		@Headers('user-agent') userAgent: string | undefined,
		@Req() request: { user?: { role?: string } },
		@Body(new ZodValidationPipe(TrackAnalyticsSchema)) data: TrackAnalyticsData,
	) {
		await this.rateLimiter.consumePerUser(
			`${ANALYTICS_CONFIG.KEY_PREFIX}:track`,
			ip,
			ANALYTICS_CONFIG.RATE_LIMITS.TRACK_MAX_PER_MINUTE,
			ANALYTICS_CONFIG.RATE_LIMITS.TRACK_WINDOW_SEC,
		);
		return this.analytics.track(data, { userAgent, role: request.user?.role });
	}
}
