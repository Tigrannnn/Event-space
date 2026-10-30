import { AppErrorCode, AuthAction } from '@event-space/shared';
import { AppException } from '@shared';
import { AuthService } from './auth.service';

const EMAIL = 'anna@example.am';

interface World {
	saved?: string | null;
}

function build(world: World = {}) {
	const store = new Map<string, string>();
	if (world.saved !== null) {
		store.set(`auth:otp:${AuthAction.RESET_PASSWORD}:${EMAIL}`, world.saved ?? '123456');
	}

	const updates: Record<string, unknown>[] = [];
	const revoked: unknown[] = [];
	const limiter: string[] = [];

	const tx = {
		user: {
			update: (args: { data: Record<string, unknown> }) => {
				updates.push(args.data);
				return Promise.resolve({
					id: 'u1',
					email: EMAIL,
					role: 'USER',
					name: 'Ани',
					passwordHash: 'old-hash',
					...args.data,
				});
			},
		},
		refreshToken: {
			deleteMany: (args: unknown) => {
				revoked.push(args);
				return Promise.resolve({ count: 1 });
			},
			create: () => Promise.resolve({ id: 'rt1' }),
		},
	};

	const prisma = { $transaction: (fn: (t: unknown) => unknown) => fn(tx) };
	const redis = {
		get: (key: string) => Promise.resolve(store.get(key) ?? null),
		del: (key: string) => {
			store.delete(key);
			return Promise.resolve();
		},
	};
	const rateLimiter = {
		validate: () => Promise.resolve(),
		hit: () => {
			limiter.push('hit');
			return Promise.resolve();
		},
		clean: () => {
			limiter.push('clean');
			return Promise.resolve();
		},
	};
	const jwt = { signAsync: () => Promise.resolve('access') };
	const config = { get: () => undefined, getOrThrow: () => 'secret' };

	const service = new AuthService(
		prisma as never,
		redis as never,
		jwt as never,
		config as never,
		rateLimiter as never,
		{} as never,
	);

	return { service, store, updates, revoked, limiter };
}

describe('signing in with the code from the email', () => {
	it('lets the person in without a password and leaves the password alone', async () => {
		const { service, updates, revoked } = build();

		const result = await service.resetPassword({ email: EMAIL, code: '123456' }, '1.1.1.1');

		expect(result.user.email).toBe(EMAIL);
		expect(updates[0]).not.toHaveProperty('passwordHash');
		expect(revoked).toHaveLength(0);
	});

	it('confirms the address and ends the guest state, the code proves the mailbox', async () => {
		const { service, updates } = build();

		await service.resetPassword({ email: EMAIL, code: '123456' }, '1.1.1.1');

		expect(updates[0]).toMatchObject({ emailVerified: true, isShadow: false });
	});

	it('sets a new password and signs the other devices out when one is given', async () => {
		const { service, updates, revoked } = build();

		await service.resetPassword({ email: EMAIL, code: '123456', newPassword: 'NewStrong1' }, '1.1.1.1');

		expect(updates[0]).toHaveProperty('passwordHash');
		expect(updates[0].passwordHash).not.toBe('NewStrong1');
		expect(revoked).toHaveLength(1);
	});

	it('uses the code once', async () => {
		const { service, store } = build();

		await service.resetPassword({ email: EMAIL, code: '123456' }, '1.1.1.1');

		expect(store.size).toBe(0);
	});

	it('takes the address however the phone capitalised it', async () => {
		const { service } = build();

		await expect(
			service.resetPassword({ email: '  Anna@Example.AM ', code: '123456' }, '1.1.1.1'),
		).resolves.toBeDefined();
	});

	it('refuses a wrong code, counts the attempt and lets nobody in', async () => {
		const { service, updates, limiter } = build();

		await expect(
			service.resetPassword({ email: EMAIL, code: '000000' }, '1.1.1.1'),
		).rejects.toMatchObject({ constructor: AppException, code: AppErrorCode.INVALID_RESET_CODE });
		expect(updates).toHaveLength(0);
		expect(limiter).toEqual(['hit']);
	});

	it('refuses when no code was asked for', async () => {
		const { service, updates } = build({ saved: null });

		await expect(
			service.resetPassword({ email: EMAIL, code: '123456' }, '1.1.1.1'),
		).rejects.toMatchObject({ code: AppErrorCode.INVALID_RESET_CODE });
		expect(updates).toHaveLength(0);
	});
});
