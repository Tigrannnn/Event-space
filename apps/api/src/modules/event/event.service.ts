import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateEventData, UpdateEventData, UserRoleType } from '@event-space/shared';
import { PrismaService } from '@infra/prisma/prisma.service';

@Injectable()
export class EventService {
	constructor(private readonly prisma: PrismaService) {}

	private readonly organizerInclude = {
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
		},
	};

	async findAll(cursor?: string, limit: number = 8, search?: string, isAdmin = false) {
		// Parse cursor: "date_id" format
		const [cursorDate, cursorId] = cursor ? cursor.split('_') : [null, null];

		// Build search filter if search query provided
		const searchFilter = search
			? {
					OR: [
						{ title: { contains: search, mode: 'insensitive' as const } },
						{ description: { contains: search, mode: 'insensitive' as const } },
						{ category: { contains: search, mode: 'insensitive' as const } },
						{ location: { contains: search, mode: 'insensitive' as const } },
					],
				}
			: {};

		// Build cursor filter for pagination
		const cursorFilter =
			cursorDate && cursorId
				? {
						OR: [
							{ date: { gt: new Date(cursorDate) } },
							{
								date: { equals: new Date(cursorDate) },
								id: { gt: cursorId },
							},
						],
					}
				: {};

		// Build status filter (public sees only PUBLISHED, admin sees all)
		const statusFilter = isAdmin ? {} : { status: 'PUBLISHED' as const };

		// Combine filters: search AND cursor AND status
		const filters = [searchFilter, cursorFilter, statusFilter].filter(
			(f) => Object.keys(f).length > 0,
		);
		const where = filters.length > 0 ? { AND: filters } : {};

		const events = await this.prisma.event.findMany({
			where,
			take: limit + 1, // Take one extra to check if there are more
			orderBy: [{ date: 'asc' }, { id: 'asc' }],
			include: { organizer: this.organizerInclude },
		});

		const hasMore = events.length > limit;
		const data = hasMore ? events.slice(0, limit) : events;

		// Build next cursor from last item: "date_id"
		const lastEvent = data[data.length - 1];
		const nextCursor =
			hasMore && lastEvent ? `${lastEvent.date.toISOString()}_${lastEvent.id}` : null;

		return {
			data,
			nextCursor,
			hasMore,
		};
	}

	async findOne(id: string) {
		const event = await this.prisma.event.findUnique({
			where: { id },
			include: { organizer: this.organizerInclude },
		});

		if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
		return event;
	}

	async create(userId: string, data: CreateEventData) {
		return await this.prisma.event.create({
			data: {
				...data,
				userId,
			},
			include: { organizer: this.organizerInclude },
		});
	}

	async update(id: string, userId: string, role: UserRoleType, data: UpdateEventData) {
		const event = await this.findOne(id);

		const isOwner = event.userId === userId;
		const isAdmin = role === 'ADMIN';

		if (!isOwner && !isAdmin) {
			throw new ForbiddenException('You do not have permission to update this event');
		}
		return await this.prisma.event.update({
			where: { id },
			data,
			include: { organizer: this.organizerInclude },
		});
	}

	async delete(id: string, userId: string, role: UserRoleType) {
		const event = await this.findOne(id);

		const isOwner = event.userId === userId;
		const isAdmin = role === 'ADMIN';

		if (!isOwner && !isAdmin) {
			throw new ForbiddenException('You do not have permission to delete this event');
		}

		return this.prisma.event.delete({ where: { id } });
	}
}
