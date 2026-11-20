import { sourceForUser } from './source-access';

const SOURCES: Record<string, string> = { direct: 'id-direct', instagram: 'id-instagram', ardvi: 'id-ardvi' };

function setup(userSource: string | null) {
	const user = { sourceCode: userSource };
	const db = {
		source: {
			findUnique: jest.fn(({ where }: { where: { code: string } }) =>
				Promise.resolve(SOURCES[where.code] ? { id: SOURCES[where.code] } : null),
			),
			create: jest.fn(),
		},
		user: {
			findUnique: jest.fn(() =>
				Promise.resolve({
					source: user.sourceCode ? { id: SOURCES[user.sourceCode], code: user.sourceCode } : null,
				}),
			),
			updateMany: jest.fn(({ where, data }: { where: object; data: { sourceId: string } }) => {
				const code = Object.keys(SOURCES).find((key) => SOURCES[key] === data.sourceId) ?? null;
				const onlyIfEmpty = 'sourceId' in where;
				if (user.sourceCode === null || (!onlyIfEmpty && user.sourceCode === 'direct')) user.sourceCode = code;
				return Promise.resolve({ count: 1 });
			}),
		},
	};
	return { db: db as never, user };
}

describe('sourceForUser', () => {
	it('keeps the first known source on the account and gives it to a booking that came directly', async () => {
		const { db, user } = setup(null);

		await expect(sourceForUser(db, 'u1', 'instagram')).resolves.toEqual({
			sourceId: 'id-instagram',
			sourceRef: 'instagram',
		});
		expect(user.sourceCode).toBe('instagram');

		await expect(sourceForUser(db, 'u1', undefined)).resolves.toEqual({
			sourceId: 'id-instagram',
			sourceRef: 'instagram',
		});
	});

	it('does not replace a known source, but replaces "direct" once a real one shows up', async () => {
		const known = setup('instagram');
		await sourceForUser(known.db, 'u1', 'ardvi');
		expect(known.user.sourceCode).toBe('instagram');

		const direct = setup('direct');
		await sourceForUser(direct.db, 'u1', 'ardvi');
		expect(direct.user.sourceCode).toBe('ardvi');
	});
});
