import { buildBookingsWhere } from './booking-filters';

const NOW = new Date('2026-11-01T00:00:00.000Z');

type SearchBranch = { OR: Record<string, unknown>[] };

const searchBranches = (search: string): Record<string, unknown>[] =>
	(buildBookingsWhere({ search }, NOW) as unknown as SearchBranch).OR;

describe('buildBookingsWhere', () => {
	it('looks for the tour through the occurrence, the only way a booking reaches an event', () => {
		const byEvent = searchBranches('Татев').find((branch) => 'occurrence' in branch);

		expect(byEvent).toBeDefined();
		expect(byEvent).toMatchObject({
			occurrence: { event: { translations: { some: {} } } },
		});
		expect(searchBranches('Татев').some((branch) => 'event' in branch)).toBe(false);
	});

	it('searches the client by name and by email', () => {
		const branches = searchBranches('ани@example.am');

		expect(branches).toContainEqual({
			user: { name: { contains: 'ани@example.am', mode: 'insensitive' } },
		});
		expect(branches).toContainEqual({
			user: { email: { contains: 'ани@example.am', mode: 'insensitive' } },
		});
	});

	it('takes a uuid as the booking id as well', () => {
		const id = '3f2a9c1e-0000-4000-8000-000000000001';
		expect(searchBranches(id)).toContainEqual({ id });
		expect(searchBranches('Татев').some((branch) => 'id' in branch)).toBe(false);
	});

	it('adds nothing when there is no search', () => {
		expect(buildBookingsWhere({}, NOW)).not.toHaveProperty('OR');
	});
});
