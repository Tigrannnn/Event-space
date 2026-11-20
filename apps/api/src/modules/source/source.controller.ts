import { Body, Controller, HttpCode, Ip, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';
import { getReference } from '@infra/swagger/swagger.utils';
import { RecordSourceVisitSchema, type RecordSourceVisitData } from '@event-space/shared';
import { SOURCE_CONFIG } from '@event-space/shared/constants';
import { ZodValidationPipe } from '@shared';
import { SourceService } from './source.service';

@ApiTags('sources')
@Controller('sources')
export class SourceController {
	constructor(
		private readonly sources: SourceService,
		private readonly rateLimiter: RateLimiterService,
	) {}

	@Post('visit')
	@HttpCode(200)
	@ApiOperation({ summary: 'Count a first visit by a link with a source label' })
	@ApiBody(getReference('RecordSourceVisitSchema'))
	async recordVisit(
		@Ip() ip: string,
		@Body(new ZodValidationPipe(RecordSourceVisitSchema)) data: RecordSourceVisitData,
	) {
		await this.rateLimiter.consumePerUser(
			`${SOURCE_CONFIG.KEY_PREFIX}:visit`,
			ip,
			SOURCE_CONFIG.RATE_LIMITS.VISIT_MAX_PER_MINUTE,
			SOURCE_CONFIG.RATE_LIMITS.VISIT_WINDOW_SEC,
		);
		return this.sources.recordVisit(data.ref);
	}
}
