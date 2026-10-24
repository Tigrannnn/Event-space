import { Prisma } from '@prisma/client';

/**
 * The banners a visitor may see right now.
 *
 * The part that matters is the last clause: a slide pointing at an event is held back unless that
 * event is still published and still has a date open. Without it the home page would go on
 * advertising a tour nobody can book, and the admin would never notice — the banner itself is
 * still "on show".
 */
export function activeBannersWhere(now: Date): Prisma.BannerWhereInput {
	return {
		status: 'ACTIVE',
		AND: [
			{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
			{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
			{
				OR: [
					{ targetType: { in: ['CATEGORY', 'URL'] } },
					{
						event: {
							status: 'PUBLISHED',
							occurrences: { some: { status: 'ACTIVE', date: { gt: now } } },
						},
					},
				],
			},
		],
	};
}
