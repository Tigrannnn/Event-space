import { Injectable, Logger } from '@nestjs/common';
import { CLOUDINARY_CONFIG } from '@event-space/shared';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class CloudinaryDeleteQueueService {
	private readonly logger = new Logger(CloudinaryDeleteQueueService.name);
	private readonly config = CLOUDINARY_CONFIG.DELETE_QUEUE;

	constructor(private readonly redis: RedisService) {}

	async enqueue(publicId: string, delaySec = 0): Promise<void> {
		if (!publicId) {
			return;
		}

		const score = Date.now() + delaySec * 1000;
		await this.redis.zadd(this.config.PENDING_ZSET, score, publicId);
		this.logger.debug(`Queued Cloudinary delete for ${publicId} (delay ${delaySec}s)`);
	}

	async enqueueMany(publicIds: string[], delaySec = 0): Promise<void> {
		const unique = [...new Set(publicIds.filter(Boolean))];
		await Promise.all(unique.map((publicId) => this.enqueue(publicId, delaySec)));
	}

	async claimDue(limit = this.config.BATCH_SIZE): Promise<string[]> {
		const due = await this.redis.zrangebyscore(
			this.config.PENDING_ZSET,
			0,
			Date.now(),
			limit,
		);

		if (!due.length) {
			return [];
		}

		await this.redis.zrem(this.config.PENDING_ZSET, ...due);
		return due;
	}

	async getAttemptCount(publicId: string): Promise<number> {
		const raw = await this.redis.get(this.attemptsKey(publicId));
		return raw ? Number(raw) : 0;
	}

	async incrementAttemptCount(publicId: string): Promise<number> {
		const key = this.attemptsKey(publicId);
		const count = await this.redis.incr(key);
		if (count === 1) {
			await this.redis.expire(key, this.config.ATTEMPTS_TTL_SEC);
		}
		return count;
	}

	async clearAttemptCount(publicId: string): Promise<void> {
		await this.redis.del(this.attemptsKey(publicId));
	}

	private attemptsKey(publicId: string): string {
		return `${this.config.ATTEMPTS_KEY_PREFIX}${publicId}`;
	}
}
