import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@src/app.module';
import cookieParser from 'cookie-parser';
import supertest from 'supertest';
import { PrismaService } from '@infra/prisma/prisma.service';
import { RedisService } from '@infra/redis/redis.service';
import { ZodExceptionFilter } from '@shared';
import { AUTH_CONFIG, AuthAction, AuthKeyType, RegisterData } from '@event-space/shared';

/**
 * Retries fetching a value from Redis until it's found or timeout is reached.
 * This is much faster and more reliable than a fixed setTimeout.
 */
async function waitForRedisKey(
	redis: RedisService,
	key: string,
	maxAttempts = 20,
	interval = 50,
): Promise<string> {
	for (let i = 0; i < maxAttempts; i++) {
		const value = await redis.get(key);
		if (value) return value;
		await new Promise((resolve) => setTimeout(resolve, interval));
	}
	throw new Error(`Redis key "${key}" not found after ${maxAttempts} attempts`);
}

describe('Auth System (e2e)', () => {
	let app: INestApplication;
	let prisma: PrismaService;
	let redis: RedisService;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		prisma = moduleFixture.get<PrismaService>(PrismaService);
		redis = moduleFixture.get<RedisService>(RedisService);

		app.use(cookieParser());
		app.useGlobalFilters(new ZodExceptionFilter());

		await app.init();
	});

	const testUser: RegisterData = {
		email: `test-${Date.now()}@example.com`,
		password: 'Password123!',
		name: 'Auto Test',
	};

	it('Health Check - Server should be up', () => {
		return supertest(app.getHttpServer())
			.get('/')
			.expect((res) => {
				expect(res.status).not.toBe(500);
			});
	});

	describe('/auth/register (POST)', () => {
		it('should successfully register a new user', async () => {
			const response = await supertest(app.getHttpServer())
				.post('/auth/register')
				.send(testUser)
				.expect(201);

			expect(response.body).toHaveProperty('userId');
			expect(response.body.message).toContain('successful');
		});

		it('should allow re-registration if email is NOT verified (update logic)', async () => {
			await redis.del(
				`${AUTH_CONFIG.KEY_PREFIX}:limit:cooldown:${AuthAction.REGISTER}:${testUser.email}`,
			);
			await redis.del(
				`${AUTH_CONFIG.KEY_PREFIX}:limit:attempts:${AuthAction.REGISTER}:${testUser.email}:*`,
			);

			const updatedData = { ...testUser, name: 'Updated Name' };

			const response = await supertest(app.getHttpServer())
				.post('/auth/register')
				.send(updatedData)
				.expect(201);

			expect(response.body.message).toContain('successful');

			const user = await prisma.user.findUnique({ where: { email: testUser.email } });
			expect(user?.name).toBe('Updated Name');
		});

		it('should throw 409 Conflict if email is already verified', async () => {
			await redis.del(
				`${AUTH_CONFIG.KEY_PREFIX}:limit:cooldown:${AuthAction.REGISTER}:${testUser.email}`,
			);
			await redis.del(
				`${AUTH_CONFIG.KEY_PREFIX}:limit:attempts:${AuthAction.REGISTER}:${testUser.email}:*`,
			);

			// Simulate verified status in DB
			await prisma.user.update({
				where: { email: testUser.email },
				data: { emailVerified: true },
			});

			await supertest(app.getHttpServer()).post('/auth/register').send(testUser).expect(409);
		});

		it('should throw 400 for invalid email format', async () => {
			await supertest(app.getHttpServer())
				.post('/auth/register')
				.send({ ...testUser, email: 'not-an-email' })
				.expect(400);
		});

		it('should throw 400 if password is too short', async () => {
			await supertest(app.getHttpServer())
				.post('/auth/register')
				.send({
					...testUser,
					email: `short-pass-${Date.now()}@test.com`,
					password: '123',
				})
				.expect(400);
		});

		it('should throw 400 when required fields are missing', async () => {
			const response = await supertest(app.getHttpServer())
				.post('/auth/register')
				.send({})
				.expect(400);

			expect(response.body.error).toBeDefined();
		});
	});

	describe('/auth/verify-email (POST)', () => {
		it('should successfully verify email with OTP from Redis', async () => {
			const otpCode = await waitForRedisKey(
				redis,
				`${AUTH_CONFIG.KEY_PREFIX}:${AuthKeyType.OTP}:${AuthAction.REGISTER}:${testUser.email}`,
			);

			expect(otpCode).toBeDefined();

			const response = await supertest(app.getHttpServer())
				.post('/auth/verify-email')
				.send({
					email: testUser.email,
					code: otpCode,
				})
				.expect(200);

			expect(response.body.message).toContain('verified');

			// Check if tokens were issued in cookies
			const cookies = response.get('Set-Cookie')?.join(' ') || '';
			expect(cookies).toContain('accessToken');
			expect(cookies).toContain('refreshToken');
			expect(cookies).toContain('HttpOnly');

			// Double check DB status
			const user = await prisma.user.findUnique({ where: { email: testUser.email } });
			expect(user?.emailVerified).toBe(true);
		});
	});

	describe('/auth/login (POST)', () => {
		it('should successfully login and return secure cookies', async () => {
			const response = await supertest(app.getHttpServer())
				.post('/auth/login')
				.send({
					email: testUser.email,
					password: testUser.password,
				})
				.expect(200);

			expect(response.body).toHaveProperty('user');
			expect(response.body.user.email).toBe(testUser.email);

			const cookies = response.get('Set-Cookie');
			expect(cookies).toBeDefined();

			const cookieString = cookies?.join(' ') || '';

			// Verify both tokens are present in cookies for SSR support
			expect(cookieString).toContain('accessToken');
			expect(cookieString).toContain('refreshToken');
			expect(cookieString).toContain('HttpOnly');
		});

		it('should throw 401 Unauthorized for wrong password', async () => {
			await supertest(app.getHttpServer())
				.post('/auth/login')
				.send({
					email: testUser.email,
					password: 'WrongPassword123!',
				})
				.expect(401);
		});

		it('should throw 401 Unauthorized if user does not exist', async () => {
			await supertest(app.getHttpServer())
				.post('/auth/login')
				.send({
					email: 'non-existent@test.com',
					password: 'SomePassword123!',
				})
				.expect(401);
		});
	});

	describe('/auth/me (GET)', () => {
		it('should return current user profile', async () => {
			const loginRes = await supertest(app.getHttpServer())
				.post('/auth/login')
				.send({ email: testUser.email, password: testUser.password });

			const authCookies: string[] | undefined = loginRes.get('Set-Cookie');

			expect(authCookies).toBeDefined();

			const response = await supertest(app.getHttpServer())
				.get('/auth/me')
				.set('Cookie', authCookies!.join('; '))
				.expect(200);

			expect(response.body).toMatchObject({
				email: testUser.email,
				emailVerified: true,
			});
			expect(response.body).not.toHaveProperty('passwordHash');
		});

		it('should throw 401 if no tokens provided', async () => {
			await supertest(app.getHttpServer()).get('/auth/me').expect(401);
		});
	});

	describe('/auth/refresh (POST)', () => {
		it('should refresh tokens and rotate the refresh token', async () => {
			// Login
			const loginRes = await supertest(app.getHttpServer())
				.post('/auth/login')
				.send({ email: testUser.email, password: testUser.password });

			const oldCookies: string[] | undefined = loginRes.get('Set-Cookie');

			expect(oldCookies).toBeDefined();

			// Wait a bit to ensure token timestamps differ (for rotation test)
			await new Promise((res) => setTimeout(res, 100));

			// Refresh tokens
			const refreshRes = await supertest(app.getHttpServer())
				.post('/auth/refresh')
				.set('Cookie', oldCookies!)
				.expect(200);

			const newCookies = refreshRes.get('Set-Cookie')?.join(' ') || '';
			expect(newCookies).toContain('accessToken');
			expect(newCookies).toContain('refreshToken');

			// Old refresh token should be invalidated
			await supertest(app.getHttpServer())
				.post('/auth/refresh')
				.set('Cookie', oldCookies!)
				.expect(403);
		});
	});

	describe('/auth/logout (POST)', () => {
		it('should clear session and return 200', async () => {
			const loginRes = await supertest(app.getHttpServer())
				.post('/auth/login')
				.send({ email: testUser.email, password: testUser.password });

			const authCookies = loginRes.get('Set-Cookie');

			await supertest(app.getHttpServer())
				.post('/auth/logout')
				.set('Cookie', authCookies!)
				.expect(200);

			await supertest(app.getHttpServer())
				.post('/auth/refresh')
				.set('Cookie', authCookies!)
				.expect(403);
		});
	});

	afterAll(async () => {
		await app.close();
	});
});
