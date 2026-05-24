import supertest from 'supertest';
import {
	AUTH_CONFIG,
	AuthAction,
} from '@event-space/shared';
import {
	buildRegisterData,
	clearAuthRateLimits,
	createGoogleOnlyUser,
	createVerifiedUserWithPassword,
	expectHttpOnlyCookies,
	joinCookies,
	loginUser,
	otpKey,
	registerUser,
	testPassword,
	uniqueEmail,
	waitForRedisKey,
} from './helpers/auth-test.utils';
import { createE2eApp, destroyE2eApp, E2eContext } from './helpers/e2e-app';

describe('Auth (e2e)', () => {
	let ctx: E2eContext;
	const primaryEmail = uniqueEmail('primary');
	const primaryPassword = testPassword();

	beforeAll(async () => {
		ctx = await createE2eApp();
	});

	afterAll(async () => {
		await destroyE2eApp(ctx);
	});

	describe('GET /health', () => {
		it('returns ok', async () => {
			const res = await supertest(ctx.httpServer).get('/health').expect(200);
			expect(res.body).toEqual({ status: 'ok' });
		});
	});

	describe('POST /auth/register', () => {
		it('creates user and stores OTP in Redis', async () => {
			const res = await registerUser(ctx.httpServer, buildRegisterData(primaryEmail)).expect(201);

			expect(res.body.userId).toBeDefined();
			expect(res.body.message).toMatch(/successful/i);

			const otp = await waitForRedisKey(ctx.redis, otpKey(AuthAction.REGISTER, primaryEmail));
			expect(otp).toMatch(/^\d{6}$/);
		});

		it('rejects duplicate email when already verified', async () => {
			await clearAuthRateLimits(ctx.redis, AuthAction.REGISTER, primaryEmail);
			await ctx.prisma.user.update({
				where: { email: primaryEmail },
				data: { emailVerified: true },
			});

			await registerUser(ctx.httpServer, buildRegisterData(primaryEmail)).expect(409);
		});

		it('allows re-register for unverified email and updates profile', async () => {
			const email = uniqueEmail('reregister');
			await registerUser(ctx.httpServer, buildRegisterData(email, 'First')).expect(201);
			await clearAuthRateLimits(ctx.redis, AuthAction.REGISTER, email);

			await registerUser(ctx.httpServer, buildRegisterData(email, 'Second')).expect(201);

			const user = await ctx.prisma.user.findUnique({ where: { email } });
			expect(user?.name).toBe('Second');
			expect(user?.emailVerified).toBe(false);
		});

		it('returns 400 for invalid payload', async () => {
			await supertest(ctx.httpServer)
				.post('/auth/register')
				.send({ email: 'bad', password: '1', name: '' })
				.expect(400);
		});

		it('enforces resend cooldown on immediate second register', async () => {
			const email = uniqueEmail('cooldown-reg');
			await registerUser(ctx.httpServer, buildRegisterData(email)).expect(201);

			await registerUser(ctx.httpServer, buildRegisterData(email)).expect(403);
		});
	});

	describe('POST /auth/verify-email', () => {
		const verifyEmail_user = uniqueEmail('verify');

		beforeAll(async () => {
			await registerUser(ctx.httpServer, buildRegisterData(verifyEmail_user)).expect(201);
		});

		it('verifies email, issues httpOnly cookies, deletes OTP', async () => {
			const otp = await waitForRedisKey(
				ctx.redis,
				otpKey(AuthAction.REGISTER, verifyEmail_user),
			);

			const res = await supertest(ctx.httpServer)
				.post('/auth/verify-email')
				.send({ email: verifyEmail_user, code: otp })
				.expect(200);

			expect(res.body.message).toMatch(/verified/i);
			expect(joinCookies(res.get('Set-Cookie'))).toContain('accessToken');
			expectHttpOnlyCookies(res.get('Set-Cookie'));

			const user = await ctx.prisma.user.findUnique({ where: { email: verifyEmail_user } });
			expect(user?.emailVerified).toBe(true);

			const otpAfter = await ctx.redis.get(otpKey(AuthAction.REGISTER, verifyEmail_user));
			expect(otpAfter).toBeNull();
		});

		it('rejects invalid OTP and increments rate limit counters', async () => {
			const email = uniqueEmail('bad-otp');
			await registerUser(ctx.httpServer, buildRegisterData(email)).expect(201);
			await clearAuthRateLimits(ctx.redis, AuthAction.REGISTER, email);

			for (let i = 0; i < AUTH_CONFIG.RATE_LIMITS.OTP_LOCAL_MAX_ATTEMPTS; i++) {
				await supertest(ctx.httpServer)
					.post('/auth/verify-email')
					.send({ email, code: '000000' })
					.expect(400);
			}

			await supertest(ctx.httpServer)
				.post('/auth/verify-email')
				.send({ email, code: '000000' })
				.expect(403);
		});
	});

	describe('POST /auth/resend-code', () => {
		it('resends OTP for existing user', async () => {
			const email = uniqueEmail('resend');
			await registerUser(ctx.httpServer, buildRegisterData(email)).expect(201);
			const firstOtp = await waitForRedisKey(ctx.redis, otpKey(AuthAction.REGISTER, email));

			await clearAuthRateLimits(ctx.redis, AuthAction.REGISTER, email);

			await supertest(ctx.httpServer)
				.post('/auth/resend-code')
				.send({ email, action: AuthAction.REGISTER })
				.expect(200);

			const secondOtp = await waitForRedisKey(ctx.redis, otpKey(AuthAction.REGISTER, email));
			expect(secondOtp).toBeDefined();
			expect(secondOtp).not.toBe(firstOtp);
		});

		it('returns 200 for unknown email without creating OTP', async () => {
			const email = uniqueEmail('ghost');
			await supertest(ctx.httpServer)
				.post('/auth/resend-code')
				.send({ email, action: AuthAction.REGISTER })
				.expect(200);

			const otp = await ctx.redis.get(otpKey(AuthAction.REGISTER, email));
			expect(otp).toBeNull();
		});

		it('blocks resend during cooldown', async () => {
			const email = uniqueEmail('resend-cooldown');
			await registerUser(ctx.httpServer, buildRegisterData(email)).expect(201);

			await supertest(ctx.httpServer)
				.post('/auth/resend-code')
				.send({ email, action: AuthAction.REGISTER })
				.expect(403);
		});
	});

	describe('POST /auth/login', () => {
		it('logs in verified user with cookies', async () => {
			const res = await loginUser(ctx.httpServer, primaryEmail, primaryPassword).expect(200);

			expect(res.body.user.email).toBe(primaryEmail);
			expect(joinCookies(res.get('Set-Cookie'))).toContain('accessToken');
			expectHttpOnlyCookies(res.get('Set-Cookie'));
		});

		it('returns 401 for wrong password', async () => {
			await loginUser(ctx.httpServer, primaryEmail, 'WrongPassword123!').expect(401);
		});

		it('returns 401 for unknown email', async () => {
			await loginUser(ctx.httpServer, uniqueEmail('unknown')).expect(401);
		});

		it('returns 403 when email is not verified', async () => {
			const email = uniqueEmail('unverified');
			await registerUser(ctx.httpServer, buildRegisterData(email)).expect(201);

			await loginUser(ctx.httpServer, email).expect(403);
		});

		it('returns 400 for Google-only account', async () => {
			const email = uniqueEmail('google-only');
			await createGoogleOnlyUser(ctx.prisma, email);

			const res = await loginUser(ctx.httpServer, email).expect(400);
			expect(res.body.message).toMatch(/social login/i);
		});
	});

	describe('GET /users/me', () => {
		it('returns profile when authenticated', async () => {
			const loginRes = await loginUser(ctx.httpServer, primaryEmail, primaryPassword).expect(200);

			const res = await supertest(ctx.httpServer)
				.get('/users/me')
				.set('Cookie', joinCookies(loginRes.get('Set-Cookie')))
				.expect(200);

			expect(res.body.email).toBe(primaryEmail);
			expect(res.body.emailVerified).toBe(true);
			expect(res.body).not.toHaveProperty('passwordHash');
		});

		it('returns 401 without cookies', async () => {
			await supertest(ctx.httpServer).get('/users/me').expect(401);
		});
	});

	describe('POST /auth/refresh', () => {
		it('rotates refresh token and invalidates the old one', async () => {
			const loginRes = await loginUser(ctx.httpServer, primaryEmail, primaryPassword).expect(200);
			const oldCookies = loginRes.get('Set-Cookie')!;

			await new Promise((r) => setTimeout(r, 50));

			const refreshRes = await supertest(ctx.httpServer)
				.post('/auth/refresh')
				.set('Cookie', joinCookies(oldCookies))
				.expect(200);

			expect(joinCookies(refreshRes.get('Set-Cookie'))).toContain('refreshToken');

			await supertest(ctx.httpServer)
				.post('/auth/refresh')
				.set('Cookie', joinCookies(oldCookies))
				.expect(403);
		});

		it('returns 401 when refresh cookie is missing', async () => {
			await supertest(ctx.httpServer).post('/auth/refresh').expect(401);
		});

		it('returns 401 for malformed refresh token', async () => {
			await supertest(ctx.httpServer)
				.post('/auth/refresh')
				.set('Cookie', 'refreshToken=not-a-valid-token')
				.expect(401);
		});
	});

	describe('POST /auth/logout', () => {
		it('revokes refresh token and clears session', async () => {
			const loginRes = await loginUser(ctx.httpServer, primaryEmail, primaryPassword).expect(200);
			const cookies = loginRes.get('Set-Cookie')!;

			await supertest(ctx.httpServer)
				.post('/auth/logout')
				.set('Cookie', joinCookies(cookies))
				.expect(200);

			await supertest(ctx.httpServer)
				.post('/auth/refresh')
				.set('Cookie', joinCookies(cookies))
				.expect(403);
		});
	});

	describe('Forgot password & reset password', () => {
		const resetEmail = uniqueEmail('reset');
		const newPassword = 'NewPassword456!';

		beforeAll(async () => {
			await createVerifiedUserWithPassword(ctx.prisma, resetEmail, testPassword());
		});

		it('POST /auth/forgot-password always returns 200', async () => {
			await supertest(ctx.httpServer)
				.post('/auth/forgot-password')
				.send({ email: uniqueEmail('missing-user') })
				.expect(200);

			await clearAuthRateLimits(ctx.redis, AuthAction.RESET_PASSWORD, resetEmail);
			await supertest(ctx.httpServer)
				.post('/auth/forgot-password')
				.send({ email: resetEmail })
				.expect(200);

			const otp = await waitForRedisKey(
				ctx.redis,
				otpKey(AuthAction.RESET_PASSWORD, resetEmail),
			);
			expect(otp).toMatch(/^\d{6}$/);
		});

		it('POST /auth/reset-password updates password, logs in, removes OTP', async () => {
			await clearAuthRateLimits(ctx.redis, AuthAction.RESET_PASSWORD, resetEmail);
			await supertest(ctx.httpServer)
				.post('/auth/forgot-password')
				.send({ email: resetEmail })
				.expect(200);

			const otp = await waitForRedisKey(
				ctx.redis,
				otpKey(AuthAction.RESET_PASSWORD, resetEmail),
			);

			const res = await supertest(ctx.httpServer)
				.post('/auth/reset-password')
				.send({ email: resetEmail, code: otp, newPassword })
				.expect(200);

			expect(res.body.message).toMatch(/reset successfully/i);
			expect(joinCookies(res.get('Set-Cookie'))).toContain('accessToken');

			const otpAfter = await ctx.redis.get(otpKey(AuthAction.RESET_PASSWORD, resetEmail));
			expect(otpAfter).toBeNull();

			await loginUser(ctx.httpServer, resetEmail, testPassword()).expect(401);
			await loginUser(ctx.httpServer, resetEmail, newPassword).expect(200);
		});

		it('rejects reused OTP after successful reset', async () => {
			await clearAuthRateLimits(ctx.redis, AuthAction.RESET_PASSWORD, resetEmail);
			await supertest(ctx.httpServer)
				.post('/auth/forgot-password')
				.send({ email: resetEmail })
				.expect(200);

			const otp = await waitForRedisKey(
				ctx.redis,
				otpKey(AuthAction.RESET_PASSWORD, resetEmail),
			);

			await supertest(ctx.httpServer)
				.post('/auth/reset-password')
				.send({ email: resetEmail, code: otp, newPassword: 'AnotherPass789!' })
				.expect(200);

			await clearAuthRateLimits(ctx.redis, AuthAction.RESET_PASSWORD, resetEmail);

			await supertest(ctx.httpServer)
				.post('/auth/reset-password')
				.send({ email: resetEmail, code: otp, newPassword: 'YetAnother99!' })
				.expect(400);
		});

		it('increments rate limits on invalid reset code', async () => {
			const email = uniqueEmail('reset-bad');
			await createVerifiedUserWithPassword(ctx.prisma, email);
			await clearAuthRateLimits(ctx.redis, AuthAction.RESET_PASSWORD, email);

			for (let i = 0; i < AUTH_CONFIG.RATE_LIMITS.OTP_LOCAL_MAX_ATTEMPTS; i++) {
				await supertest(ctx.httpServer)
					.post('/auth/reset-password')
					.send({ email, code: '000000', newPassword: testPassword() })
					.expect(400);
			}

			await supertest(ctx.httpServer)
				.post('/auth/reset-password')
				.send({ email, code: '000000', newPassword: testPassword() })
				.expect(403);
		});
	});

	describe('POST /auth/google', () => {
		it('rejects invalid Google authorization code', async () => {
			const res = await supertest(ctx.httpServer)
				.post('/auth/google')
				.send({ token: 'invalid-google-code' })
				.expect(401);

			expect(res.body.message).toMatch(/Google authentication failed/i);
		});
	});

	describe('Login brute-force rate limiting', () => {
		it('locks out after max failed login attempts', async () => {
			const email = uniqueEmail('login-bruteforce');
			await createVerifiedUserWithPassword(ctx.prisma, email);
			await clearAuthRateLimits(ctx.redis, AuthAction.LOGIN, email);

			for (let i = 0; i < AUTH_CONFIG.RATE_LIMITS.OTP_LOCAL_MAX_ATTEMPTS; i++) {
				await loginUser(ctx.httpServer, email, 'WrongPassword123!').expect(401);
			}

			await loginUser(ctx.httpServer, email, testPassword()).expect(403);
		});
	});
});
