import { Prisma } from '@prisma/client';
import { AppErrorCode, type UpdateShadowUserData } from '@event-space/shared';
import { AppException } from '@shared';
import { AdminUsersService } from './admin-users.service';

interface World {
	user?: { isShadow: boolean } | null;
	emailTaken?: boolean;
}

function build(world: World = {}) {
	const updates: { data: Record<string, unknown> }[] = [];

	const prisma = {
		user: {
			findUnique: () => Promise.resolve(world.user === undefined ? { isShadow: true } : world.user),
			update: (args: { data: Record<string, unknown> }) => {
				updates.push(args);

				if (world.emailTaken) {
					return Promise.reject(
						new Prisma.PrismaClientKnownRequestError('unique', {
							code: 'P2002',
							clientVersion: 'test',
						}),
					);
				}

				return Promise.resolve({ id: 'u1', ...args.data });
			},
		},
	};

	return { service: new AdminUsersService(prisma as never), updates };
}

const codeOf = async (promise: Promise<unknown>): Promise<AppErrorCode> => {
	try {
		await promise;
	} catch (error) {
		return (error as AppException).code;
	}
	throw new Error('expected the call to be refused');
};

describe('fixing a guest profile', () => {
	it('writes the fields the admin filled in', async () => {
		const { service, updates } = build();

		await service.updateShadow('u1', {
			name: 'Ани Саргсян',
			phone: '+374 99 123 456',
			email: 'ani@example.am',
		});

		expect(updates[0].data).toEqual({
			name: 'Ани Саргсян',
			phone: '+374 99 123 456',
			email: 'ani@example.am',
		});
	});

	it('stores the email lowercased and trimmed, the way sign-in looks it up', async () => {
		const { service, updates } = build();

		await service.updateShadow('u1', { email: '  Ani@Example.AM  ' });

		expect(updates[0].data).toEqual({ email: 'ani@example.am' });
	});

	it('leaves out a field the admin did not touch', async () => {
		const { service, updates } = build();

		await service.updateShadow('u1', { name: 'Ани' });

		expect(updates[0].data).toEqual({ name: 'Ани' });
	});

	it('clears the email when it is sent as null', async () => {
		const { service, updates } = build();

		await service.updateShadow('u1', { email: null });

		expect(updates[0].data).toEqual({ email: null });
	});

	it('refuses an account that belongs to a real person', async () => {
		const { service, updates } = build({ user: { isShadow: false } });

		expect(await codeOf(service.updateShadow('u1', { email: 'thief@example.am' }))).toBe(
			AppErrorCode.USER_NOT_SHADOW,
		);
		expect(updates).toHaveLength(0);
	});

	it('refuses a user that is not there', async () => {
		const { service } = build({ user: null });

		expect(await codeOf(service.updateShadow('u1', { name: 'Ани' }))).toBe(
			AppErrorCode.USER_NOT_FOUND,
		);
	});

	it('reports a taken email instead of letting the database error through', async () => {
		const { service } = build({ emailTaken: true });

		expect(await codeOf(service.updateShadow('u1', { email: 'taken@example.am' }))).toBe(
			AppErrorCode.EMAIL_ALREADY_EXISTS,
		);
	});

	it('passes an empty object through without inventing fields', async () => {
		const { service, updates } = build();

		await service.updateShadow('u1', {});

		expect(updates[0].data).toEqual({});
	});
});
