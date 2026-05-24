import Redis from 'ioredis';
import { assertTestRedisUrl } from './assert-test-env';

export async function flushTestRedis(): Promise<void> {
	assertTestRedisUrl();

	const url = process.env.REDIS_URL ?? 'redis://localhost:6379/1';
	const client = new Redis(url);

	try {
		await client.flushdb();
	} finally {
		await client.quit();
	}
}
