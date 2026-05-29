import { SetMetadata } from '@nestjs/common';
import type { EventMutationRateLimitAction } from '@event-space/shared';

export const EVENT_MUTATION_RATE_LIMIT_KEY = 'eventMutationRateLimit';

export const RateLimitEventMutation = (action: EventMutationRateLimitAction) =>
	SetMetadata(EVENT_MUTATION_RATE_LIMIT_KEY, action);
