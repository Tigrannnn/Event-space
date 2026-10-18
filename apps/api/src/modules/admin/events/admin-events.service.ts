import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import type { PaginatedParams } from '@event-space/shared';
import { toPage } from '../common/query-helpers';
import { attachBookingStats } from './event-booking-stats';
import { buildEventsWhere, type EventFilters } from './event-filters';

type FindAllEventsParams = PaginatedParams & EventFilters;

@Injectable()
export class AdminEventsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll({ skip = 0, limit = 20, ...filters }: FindAllEventsParams = {}) {
		// Occupancy compares one column against another, which Prisma expresses as a field
		// reference. Keeping it in the query rather than filtering the fetched page in JS is what
		// keeps `total` and `hasMore` honest: a filter applied after `take` would report counts
		// that don't match the rows the table actually shows.
		const hasFreeSpot = { lt: this.prisma.eventOccurrence.fields.maxParticipants };
		const where = buildEventsWhere(filters, new Date(), hasFreeSpot);

		const [events, total] = await Promise.all([
			this.prisma.event.findMany({
				where,
				skip,
				take: limit + 1,
				orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
				include: {
					cancellationRules: true,
					translations: true,
					organizer: {
						select: { id: true, name: true, email: true, image: true, phone: true },
					},
					images: { orderBy: { order: 'asc' } },
					occurrences: { orderBy: { date: 'asc' } },
					category: { include: { translations: true } },
				},
			}),
			this.prisma.event.count({ where }),
		]);

		const page = toPage(events, total, skip, limit);

		return { ...page, data: await attachBookingStats(this.prisma, page.data) };
	}
}
