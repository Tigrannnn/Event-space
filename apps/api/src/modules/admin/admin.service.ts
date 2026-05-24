import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import type {
	SafeUserData,
	UserRoleType,
	TimeFilterType,
	EventStatus,
	EventDifficulty,
	BookingStatus,
	DashboardStats,
} from '@event-space/shared';

const safeUserSelect = {
	id: true,
	email: true,
	name: true,
	image: true,
	role: true,
	emailVerified: true,
	createdAt: true,
	updatedAt: true,
};

const bookingInclude = {
	user: {
		select: safeUserSelect,
	},
	event: {
		include: { images: true },
	},
} as const;


interface FindAllUsersParams {
	skip?: number;
	limit?: number;
	search?: string;
	role?: UserRoleType;
	emailVerified?: boolean;
}

interface FindAllBookingsParams {
	skip?: number;
	limit?: number;
	search?: string;
	status?: BookingStatus;
	time?: TimeFilterType;
}

interface FindAllEventsParams {
	skip?: number;
	limit?: number;
	search?: string;
	status?: EventStatus;
	difficulty?: EventDifficulty;
	time?: TimeFilterType;
}

@Injectable()
export class AdminService {
	constructor(private readonly prisma: PrismaService) {}

	async getDashboardStats(): Promise<DashboardStats> {
		const now = new Date();
		const weekFromNow = new Date(now);
		weekFromNow.setDate(weekFromNow.getDate() + 7);

		const [
			totalEvents,
			totalUsers,
			totalBookings,
			confirmedBookings,
			pendingBookings,
			cancelledBookings,
			publishedEvents,
			draftEvents,
			cancelledEvents,
			upcomingEventsCount,
			eventsThisWeek,
			eventsWithNoBookings,
			capacityTotals,
			recentBookings,
			recentUsers,
			recentEvents,
			upcomingEvents,
		] = await Promise.all([
			this.prisma.event.count(),
			this.prisma.user.count(),
			this.prisma.booking.count(),
			this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
			this.prisma.booking.count({ where: { status: 'PENDING' } }),
			this.prisma.booking.count({ where: { status: 'CANCELLED' } }),
			this.prisma.event.count({ where: { status: 'PUBLISHED' } }),
			this.prisma.event.count({ where: { status: 'DRAFT' } }),
			this.prisma.event.count({ where: { status: 'CANCELLED' } }),
			this.prisma.event.count({ where: { date: { gte: now } } }),
			this.prisma.event.count({ where: { date: { gte: now, lte: weekFromNow } } }),
			this.prisma.event.count({ where: { bookings: { none: {} } } }),
			this.prisma.event.aggregate({
				_sum: {
					currentParticipants: true,
					maxParticipants: true,
				},
			}),
			this.prisma.booking.findMany({
				take: 5,
				orderBy: { createdAt: 'desc' },
				include: bookingInclude,
			}),
			this.prisma.user.findMany({
				take: 5,
				orderBy: { createdAt: 'desc' },
				select: safeUserSelect,
			}),
			this.prisma.event.findMany({
				take: 5,
				orderBy: { createdAt: 'desc' },
				include: {
					organizer: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
				},
			}),
			this.prisma.event.findMany({
				take: 5,
				where: { date: { gte: now } },
				orderBy: [{ date: 'asc' }, { id: 'asc' }],
				include: {
					organizer: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
				},
			}),
		]);

		// Calculate revenue from confirmed bookings
		const confirmedBookingsData = await this.prisma.booking.findMany({
			where: { status: 'CONFIRMED' },
			include: {
				event: {
					select: { price: true },
				},
			},
		});

		const totalRevenue = confirmedBookingsData.reduce(
			(sum, booking) => sum + Number(booking.event.price) * booking.quantity,
			0,
		);
		const totalCapacity = capacityTotals._sum.maxParticipants ?? 0;
		const usedCapacity = capacityTotals._sum.currentParticipants ?? 0;
		const bookingConfirmationRate =
			totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0;
		const capacityUsageRate =
			totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;

		return {
			totalEvents,
			totalUsers,
			totalBookings,
			confirmedBookings,
			pendingBookings,
			cancelledBookings,
			totalRevenue,
			bookingConfirmationRate,
			capacityUsageRate,
			totalCapacity,
			usedCapacity,
			events: {
				published: publishedEvents,
				draft: draftEvents,
				cancelled: cancelledEvents,
				upcoming: upcomingEventsCount,
			},
			attention: {
				pendingBookings,
				draftEvents,
				eventsThisWeek,
				eventsWithNoBookings,
			},
			recentBookings: recentBookings.map((b) => ({
				...b,
				event: b.event ? { ...b.event, price: Number(b.event.price) } : undefined,
			})),
			recentUsers,
			recentEvents: recentEvents.map((e) => ({ ...e, price: Number(e.price) })),
			upcomingEvents: upcomingEvents.map((e) => ({ ...e, price: Number(e.price) })),
		};
	}

	async findAllUsers({
		skip = 0,
		limit = 20,
		search,
		role,
		emailVerified,
	}: FindAllUsersParams = {}) {
		const where = {
			...(search
				? {
						OR: [
							{ name: { contains: search, mode: 'insensitive' as const } },
							{ email: { contains: search, mode: 'insensitive' as const } },
						],
					}
				: {}),
			...(role ? { role } : {}),
			...(typeof emailVerified === 'boolean' ? { emailVerified } : {}),
		};

		const [users, total] = await Promise.all([
			this.prisma.user.findMany({
				where,
				skip,
				take: limit + 1,
				orderBy: { createdAt: 'desc' },
				select: safeUserSelect,
			}),
			this.prisma.user.count({ where }),
		]);

		const hasMore = users.length > limit;
		const data = hasMore ? users.slice(0, limit) : users;

		return {
			data,
			total,
			skip,
			take: limit,
			hasMore,
			nextSkip: hasMore ? skip + limit : null,
		};
	}

	async findOneUser(id: string): Promise<SafeUserData | null> {
		return this.prisma.user.findUnique({ where: { id }, select: safeUserSelect });
	}

	async deleteUser(id: string): Promise<void> {
		await this.prisma.$transaction([
			this.prisma.refreshToken.deleteMany({ where: { userId: id } }),
			this.prisma.user.delete({ where: { id } }),
		]);
	}

	async updateUserRole(id: string, role: 'USER' | 'ORGANIZER' | 'ADMIN'): Promise<SafeUserData> {
		const user = await this.prisma.user.update({
			where: { id },
			data: { role },
			select: safeUserSelect,
		});
		return user;
	}



	async findAllBookings({ skip = 0, limit = 20, search, status, time }: FindAllBookingsParams = {}) {
		const now = new Date();
		const where = {
			...(search
				? {
						OR: [
							{ user: { name: { contains: search, mode: 'insensitive' as const } } },
							{ user: { email: { contains: search, mode: 'insensitive' as const } } },
							{ event: { title: { contains: search, mode: 'insensitive' as const } } },
							{ event: { location: { contains: search, mode: 'insensitive' as const } } },
						],
					}
				: {}),
			...(status ? { status } : {}),
			...(time === 'upcoming' ? { event: { date: { gte: now } } } : {}),
			...(time === 'completed' ? { event: { date: { lt: now } } } : {}),
		};

		const [bookings, total] = await Promise.all([
			this.prisma.booking.findMany({
				where,
				skip,
				take: limit + 1,
				orderBy: { createdAt: 'desc' },
				include: bookingInclude,
			}),
			this.prisma.booking.count({ where }),
		]);

		const hasMore = bookings.length > limit;
		const data = hasMore ? bookings.slice(0, limit) : bookings;

		return {
			data,
			total,
			skip,
			take: limit,
			hasMore,
			nextSkip: hasMore ? skip + limit : null,
		};
	}

	async updateBookingStatus(id: string, status: BookingStatus) {
		return this.prisma.$transaction(async (tx) => {
			const booking = await tx.booking.findUnique({
				where: { id },
				include: { event: true },
			});

			if (!booking) {
				throw new NotFoundException('Booking not found');
			}

			if (booking.status === status) {
				return tx.booking.findUnique({
					where: { id },
					include: bookingInclude,
				});
			}

			const wasConfirmed = booking.status === 'CONFIRMED';
			const willBeConfirmed = status === 'CONFIRMED';
			const participantDelta =
				Number(willBeConfirmed) * booking.quantity - Number(wasConfirmed) * booking.quantity;

			if (participantDelta > 0) {
				const reserved = await tx.event.updateMany({
					where: {
						id: booking.eventId,
						currentParticipants: { lte: booking.event.maxParticipants - participantDelta },
					},
					data: { currentParticipants: { increment: participantDelta } },
				});

				if (reserved.count === 0) {
					const spotsLeft = Math.max(
						0,
						booking.event.maxParticipants - booking.event.currentParticipants,
					);
					throw new ConflictException(
						spotsLeft === 0 ? 'No spots available' : `Only ${spotsLeft} spots available`,
					);
				}
			} else if (participantDelta < 0) {
				const releaseQty = -participantDelta;
				const released = await tx.event.updateMany({
					where: {
						id: booking.eventId,
						currentParticipants: { gte: releaseQty },
					},
					data: { currentParticipants: { decrement: releaseQty } },
				});

				if (released.count === 0) {
					throw new ConflictException('Unable to release spots');
				}
			}

			return tx.booking.update({
				where: { id },
				data: { status },
				include: bookingInclude,
			});
		});
	}

	async findAllEvents({
		skip = 0,
		limit = 20,
		search,
		status,
		difficulty,
		time,
	}: FindAllEventsParams = {}) {
		const now = new Date();
		const where = {
			...(search
				? {
						OR: [
							{ title: { contains: search, mode: 'insensitive' as const } },
							{ description: { contains: search, mode: 'insensitive' as const } },
							{ category: { contains: search, mode: 'insensitive' as const } },
							{ location: { contains: search, mode: 'insensitive' as const } },
						],
					}
				: {}),
			...(status ? { status } : {}),
			...(difficulty ? { difficulty } : {}),
			...(time === 'upcoming' ? { date: { gte: now } } : {}),
			...(time === 'completed' ? { date: { lt: now } } : {}),
		};

		const [events, total] = await Promise.all([
			this.prisma.event.findMany({
				where,
				skip,
				take: limit + 1,
				orderBy: [{ date: 'asc' }, { id: 'asc' }],
				include: {
					organizer: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
					images: { orderBy: { order: 'asc' } },
				},
			}),
			this.prisma.event.count({ where }),
		]);

		const hasMore = events.length > limit;
		const data = hasMore ? events.slice(0, limit) : events;

		return {
			data,
			total,
			skip,
			take: limit,
			hasMore,
			nextSkip: hasMore ? skip + limit : null,
		};
	}
}
