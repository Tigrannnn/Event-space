import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
	AppErrorCode,
	EVENT_UPLOAD_CONFIG,
	type EventMutationRateLimitAction,
} from '@event-space/shared';
import { AppException } from '@shared';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';
import {
	EVENT_MUTATION_RATE_LIMIT_KEY,
} from '../decorators/rate-limit-event-mutation.decorator';

@Injectable()
export class EventMutationRateLimitGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly rateLimiter: RateLimiterService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const action = this.reflector.get<EventMutationRateLimitAction | undefined>(
			EVENT_MUTATION_RATE_LIMIT_KEY,
			context.getHandler(),
		);
		if (!action) {
			return true;
		}

		const request = context.switchToHttp().getRequest<{
			user?: { sub?: string };
			ip?: string;
			socket?: { remoteAddress?: string };
		}>();

		const userId = request.user?.sub;
		if (!userId) {
			throw new AppException(AppErrorCode.UNAUTHORIZED);
		}

		const ip = request.ip || request.socket?.remoteAddress || 'unknown';
		const limits =
			action === 'create'
				? EVENT_UPLOAD_CONFIG.RATE_LIMITS.CREATE
				: EVENT_UPLOAD_CONFIG.RATE_LIMITS.UPDATE;
		const prefix = EVENT_UPLOAD_CONFIG.KEY_PREFIX;

		await Promise.all([
			this.rateLimiter.consumeFixedWindow(
				`${prefix}:${action}:user:${userId}`,
				limits.MAX_PER_USER,
				limits.WINDOW_SEC,
			),
			this.rateLimiter.consumeFixedWindow(
				`${prefix}:${action}:ip:${ip}`,
				limits.MAX_PER_IP,
				limits.WINDOW_SEC,
			),
		]);

		return true;
	}
}
