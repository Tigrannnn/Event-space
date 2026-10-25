import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { AppErrorCode, AuthAction } from '@event-space/shared';
import { AppException } from '@shared';
import { AuthService } from './auth.service';

const PASSWORD = 'StrongPass1';
const USER_ID = 'u1';

interface World {
	user?: Record<string, unknown> | null;
	emailOwner?: { id: string } | null;
	saved?: string | null;
	updateFails?: boolean;
	passwordHash?: string | null;
}

async function build(world: World = {}) {
	const hash =
		world.passwordHash === undefined ? await bcrypt.hash(PASSWORD, 4) : world.passwordHash;

	const redisStore = new Map<string, string>();
	if (world.saved !== undefined && world.saved !== null) {
		redisStore.set(`auth:otp:${AuthAction.CHANGE_EMAIL}:new@example.am`, world.saved);
	}

	const updates: Record<string, unknown>[] = [];
	const notices: Record<string, unknown>[] = [];
	const limiterCalls: string[] = [];

	const currentUser = {
		id: USER_ID,
		email: 'old@example.am',
		name: 'Ани',
		locale: 'ru',
		passwordHash: hash,
		...world.user,
	};

	const prisma = {
		user: {
			findUnique: (args: { where: { id?: string; email?: string } }) => {
				if (args.where.email) return Promise.resolve(world.emailOwner ?? null);
				return Promise.resolve(world.user === null ? null : currentUser);
			},
			update: (args: { data: Record<string, unknown> }) => {
				updates.push(args.data);

				if (world.updateFails) {
					return Promise.reject(
						new Prisma.PrismaClientKnownRequestError('unique', {
							code: 'P2002',
							clientVersion: 'test',
						}),
					);
				}

				return Promise.resolve({ ...currentUser, ...args.data });
			},
			updateMany: () => Promise.resolve({ count: 0 }),
		},
	};

	const redis = {
		get: (key: string) => Promise.resolve(redisStore.get(key) ?? null),
		set: (key: string, value: string) => {
			redisStore.set(key, value);
			return Promise.resolve();
		},
		del: (key: string) => {
			redisStore.delete(key);
			return Promise.resolve();
		},
	};

	const rateLimiter = {
		validate: () => {
			limiterCalls.push('validate');
			return Promise.resolve();
		},
		hit: () => {
			limiterCalls.push('hit');
			return Promise.resolve();
		},
		clean: () => {
			limiterCalls.push('clean');
			return Promise.resolve();
		},
		setCooldown: () => Promise.resolve(),
	};

	const mail = {
		sendVerificationCode: () => Promise.resolve(),
		sendEmailChangedNotice: (payload: Record<string, unknown>) => {
			notices.push(payload);
			return Promise.resolve(true);
		},
	};

	const config = { get: () => undefined, getOrThrow: () => 'secret' };

	const service = new AuthService(
		prisma as never,
		redis as never,
		{} as never,
		config as never,
		rateLimiter as never,
		mail as never,
	);

	return { service, redisStore, updates, notices, limiterCalls };
}

const codeOf = async (promise: Promise<unknown>): Promise<AppErrorCode> => {
	try {
		await promise;
	} catch (error) {
		return (error as AppException).code;
	}
	throw new Error('expected the call to be refused');
};

describe('asking to change the email', () => {
	it('stores the code against the user who asked, not just the address', async () => {
		const { service, redisStore } = await build();

		await service.requestEmailChange(
			USER_ID,
			{ email: 'new@example.am', password: PASSWORD },
			'1.1.1.1',
		);

		const saved = redisStore.get(`auth:otp:${AuthAction.CHANGE_EMAIL}:new@example.am`);
		expect(saved).toMatch(new RegExp(`^${USER_ID}:\\d+$`));
	});

	it('lowercases the address before anything is keyed on it', async () => {
		const { service, redisStore } = await build();

		await service.requestEmailChange(
			USER_ID,
			{ email: ' New@Example.AM ', password: PASSWORD },
			'1.1.1.1',
		);

		expect(redisStore.has(`auth:otp:${AuthAction.CHANGE_EMAIL}:new@example.am`)).toBe(true);
	});

	it('refuses a wrong password', async () => {
		const { service, redisStore } = await build();

		expect(
			await codeOf(
				service.requestEmailChange(
					USER_ID,
					{ email: 'new@example.am', password: 'Wrong1234' },
					'1.1.1.1',
				),
			),
		).toBe(AppErrorCode.INVALID_CREDENTIALS);
		expect(redisStore.size).toBe(0);
	});

	it('refuses a missing password when the account has one', async () => {
		const { service } = await build();

		expect(
			await codeOf(service.requestEmailChange(USER_ID, { email: 'new@example.am' }, '1.1.1.1')),
		).toBe(AppErrorCode.INVALID_CREDENTIALS);
	});

	it('asks for no password from an account that signs in with Google', async () => {
		const { service, redisStore } = await build({ passwordHash: null });

		await service.requestEmailChange(USER_ID, { email: 'new@example.am' }, '1.1.1.1');

		expect(redisStore.size).toBe(1);
	});

	it('refuses the address the account already has', async () => {
		const { service } = await build();

		expect(
			await codeOf(
				service.requestEmailChange(USER_ID, { email: 'old@example.am', password: PASSWORD }, '1.1.1.1'),
			),
		).toBe(AppErrorCode.EMAIL_UNCHANGED);
	});

	it('refuses an address somebody else holds, before sending anything', async () => {
		const { service, redisStore } = await build({ emailOwner: { id: 'other' } });

		expect(
			await codeOf(
				service.requestEmailChange(USER_ID, { email: 'new@example.am', password: PASSWORD }, '1.1.1.1'),
			),
		).toBe(AppErrorCode.EMAIL_ALREADY_EXISTS);
		expect(redisStore.size).toBe(0);
	});
});

describe('confirming the change', () => {
	it('moves the account and tells the old address', async () => {
		const { service, updates, notices, redisStore } = await build({ saved: `${USER_ID}:123456` });

		const result = await service.confirmEmailChange(
			USER_ID,
			{ email: 'new@example.am', code: '123456' },
			'1.1.1.1',
		);

		expect(updates[0]).toEqual({ email: 'new@example.am', emailVerified: true, isShadow: false });
		expect(notices[0]).toMatchObject({ to: 'old@example.am', newEmail: 'new@example.am' });
		expect(result.email).toBe('new@example.am');
		expect(redisStore.size).toBe(0);
	});

	it('refuses a code that was issued to another account', async () => {
		const { service, updates, limiterCalls } = await build({ saved: 'someone-else:123456' });

		expect(
			await codeOf(
				service.confirmEmailChange(USER_ID, { email: 'new@example.am', code: '123456' }, '1.1.1.1'),
			),
		).toBe(AppErrorCode.INVALID_VERIFICATION_CODE);
		expect(updates).toHaveLength(0);
		expect(limiterCalls).toContain('hit');
	});

	it('refuses a wrong code', async () => {
		const { service, updates } = await build({ saved: `${USER_ID}:123456` });

		expect(
			await codeOf(
				service.confirmEmailChange(USER_ID, { email: 'new@example.am', code: '000000' }, '1.1.1.1'),
			),
		).toBe(AppErrorCode.INVALID_VERIFICATION_CODE);
		expect(updates).toHaveLength(0);
	});

	it('says so when no change was asked for or the code has expired', async () => {
		const { service } = await build();

		expect(
			await codeOf(
				service.confirmEmailChange(USER_ID, { email: 'new@example.am', code: '123456' }, '1.1.1.1'),
			),
		).toBe(AppErrorCode.EMAIL_CHANGE_NOT_REQUESTED);
	});

	it('reports a taken address instead of letting the database error through', async () => {
		const { service } = await build({ saved: `${USER_ID}:123456`, updateFails: true });

		expect(
			await codeOf(
				service.confirmEmailChange(USER_ID, { email: 'new@example.am', code: '123456' }, '1.1.1.1'),
			),
		).toBe(AppErrorCode.EMAIL_ALREADY_EXISTS);
	});
});
