import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
	private client!: Redis;
	private readonly logger = new Logger(RedisService.name);

	onModuleInit() {
		const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

		this.client = new Redis(redisUrl);

		this.client.on('connect', () => {
			this.logger.log('✅ Redis connected successfully');
		});

		this.client.on('error', (err) => {
			this.logger.error('❌ Redis connection error:', err);
		});
	}

	onModuleDestroy() {
		this.client.disconnect();
	}

	async set(key: string, value: string, ttl: number) {
		await this.client.set(key, value, 'EX', ttl);
	}

	async get(key: string): Promise<string | null> {
		return this.client.get(key);
	}

	async del(key: string) {
		await this.client.del(key);
	}

	async incr(key: string): Promise<number> {
		return await this.client.incr(key);
	}

	async expire(key: string, seconds: number): Promise<number> {
		return await this.client.expire(key, seconds);
	}

	/**
	 * Atomically increment counter and set TTL on first increment (fixed-window rate limit).
	 * Uses Lua script to ensure no race conditions.
	 */
	async incrWithTTL(key: string, ttl: number): Promise<number> {
		const script = `
			local current = redis.call('INCR', KEYS[1])
			if current == 1 then
				redis.call('EXPIRE', KEYS[1], ARGV[1])
			end
			return current
		`;
		return (await this.client.eval(script, 1, key, ttl)) as number;
	}

	async zadd(key: string, score: number, member: string): Promise<number> {
		return await this.client.zadd(key, score, member);
	}

	async zrangebyscore(
		key: string,
		min: number | string,
		max: number | string,
		limit?: number,
	): Promise<string[]> {
		if (limit !== undefined) {
			return await this.client.zrangebyscore(key, min, max, 'LIMIT', 0, limit);
		}
		return await this.client.zrangebyscore(key, min, max);
	}

	async zrem(key: string, ...members: string[]): Promise<number> {
		return await this.client.zrem(key, ...members);
	}
}
