import { Server } from 'http';
import * as bcrypt from 'bcrypt';
import supertest from 'supertest';
import {
	AUTH_CONFIG,
	AuthAction,
	AuthKeyType,
	Email,
	RegisterData,
} from '@event-space/shared';
import { PrismaService } from '@infra/prisma/prisma.service';
import { RedisService } from '@infra/redis/redis.service';

const TEST_IP = '127.0.0.1';

export function uniqueEmail(prefix: string): string {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export function testPassword(): string {
	return 'Password123!';
}

export function buildRegisterData(email: string, name = 'E2E User'): RegisterData {
	return { email, password: testPassword(), name };
}

export function otpKey(action: AuthAction, email: Email): string {
	return `${AUTH_CONFIG.KEY_PREFIX}:${AuthKeyType.OTP}:${action}:${email}`;
}

export function joinCookies(setCookie?: string[]): string {
	if (!setCookie?.length) return '';
	return setCookie.map((c) => c.split(';')[0]).join('; ');
}

export function expectHttpOnlyCookies(setCookie?: string[]): void {
	expect(setCookie?.length).toBeGreaterThan(0);
	const combined = setCookie!.join(' ').toLowerCase();
	expect(combined).toContain('httponly');
}

export async function waitForRedisKey(
	redis: RedisService,
	key: string,
	maxAttempts = 30,
	intervalMs = 50,
): Promise<string> {
	for (let i = 0; i < maxAttempts; i++) {
		const value = await redis.get(key);
		if (value) return value;
		await new Promise((resolve) => setTimeout(resolve, intervalMs));
	}
	throw new Error(`Redis key "${key}" not found after ${maxAttempts} attempts`);
}

export async function clearAuthRateLimits(
	redis: RedisService,
	action: AuthAction,
	email: Email,
	ip = TEST_IP,
): Promise<void> {
	const attemptsBase = `${AUTH_CONFIG.KEY_PREFIX}:limit:${AuthKeyType.ATTEMPTS}:${action}:${email}`;
	const cooldownKey = `${AUTH_CONFIG.KEY_PREFIX}:limit:${AuthKeyType.COOLDOWN}:${action}:${email}`;

	await redis.del(cooldownKey);
	await redis.del(`${attemptsBase}:${ip}`);
	await redis.del(`${attemptsBase}:global`);
}

export function registerUser(httpServer: Server, data: RegisterData) {
	return supertest(httpServer).post('/auth/register').send(data);
}

export async function verifyEmail(
	httpServer: Server,
	redis: RedisService,
	email: Email,
	code?: string,
) {
	const otp =
		code ?? (await waitForRedisKey(redis, otpKey(AuthAction.REGISTER, email)));

	return supertest(httpServer).post('/auth/verify-email').send({ email, code: otp });
}

export function loginUser(httpServer: Server, email: Email, password = testPassword()) {
	return supertest(httpServer).post('/auth/login').send({ email, password });
}

/** Register → verify → return cookies for authenticated requests. */
export async function registerVerifyAndLogin(
	httpServer: Server,
	prisma: PrismaService,
	redis: RedisService,
	email: string,
): Promise<{ email: string; cookies: string; userId: string }> {
	const registerData = buildRegisterData(email);
	await registerUser(httpServer, registerData).expect(201);

	const otp = await waitForRedisKey(redis, otpKey(AuthAction.REGISTER, email));
	const verifyRes = await supertest(httpServer)
		.post('/auth/verify-email')
		.send({ email, code: otp })
		.expect(200);

	const cookies = joinCookies(verifyRes.get('Set-Cookie'));

	const user = await prisma.user.findUniqueOrThrow({ where: { email } });
	return { email, cookies, userId: user.id };
}

export async function createGoogleOnlyUser(
	prisma: PrismaService,
	email: string,
): Promise<{ id: string }> {
	return prisma.user.create({
		data: {
			email,
			name: 'Google Only',
			googleId: `google-${Date.now()}`,
			emailVerified: true,
		},
		select: { id: true },
	});
}

export async function createVerifiedUserWithPassword(
	prisma: PrismaService,
	email: string,
	password = testPassword(),
): Promise<{ id: string }> {
	const passwordHash = await bcrypt.hash(password, AUTH_CONFIG.STRATEGY.BCRYPT_SALT_ROUNDS);
	return prisma.user.create({
		data: {
			email,
			name: 'Verified User',
			passwordHash,
			emailVerified: true,
		},
		select: { id: true },
	});
}
