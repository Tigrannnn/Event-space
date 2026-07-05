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
	PaginatedParams,
	CreateCategoryData,
	UpdateCategoryData,
	BookingWithDetails,
} from '@event-space/shared';

const safeUserSelect = {
	id: true,
	email: true,
	name: true,
	phone: true,
	image: true,
	role: true,
	emailVerified: true,
	isShadow: true,
	createdAt: true,
	updatedAt: true,
};

const bookingInclude = {
	user: {
		select: safeUserSelect,
	},
	occurrence: {
		include: {
			event: {
				include: {
					images: true,
					cancellationRules: true,
					translations: true,
					category: { include: { translations: true } },
					occurrences: true,
				},
			},
		},
	},
	adjustments: true,
} as const;

interface FindAllUsersParams extends PaginatedParams {
	search?: string;
	role?: UserRoleType;
	emailVerified?: boolean;
}

interface FindAllBookingsParams extends PaginatedParams {
	search?: string;
	status?: BookingStatus;
	time?: TimeFilterType;
	eventId?: string;
}

interface FindAllEventsParams extends PaginatedParams {
	search?: string;
	status?: EventStatus;
	difficulty?: EventDifficulty;
	time?: TimeFilterType;
	minPrice?: number;
	maxPrice?: number;
}

const normalizeBookingResponse = (booking: any): BookingWithDetails => {
	const normalizedOccurrence = booking.occurrence
		? {
				...booking.occurrence,
				event: booking.occurrence.event
					? {
						...booking.occurrence.event,
						price: Number(booking.occurrence.event.price),
					}
					: undefined,
			}
		: undefined;

	return {
		...booking,
		amount: Number(booking.amount),
		event: booking.occurrence?.event
			? {
					...booking.occurrence.event,
					price: Number(booking.occurrence.event.price),
				}
			: undefined,
		occurrence: normalizedOccurrence,
		adjustments: booking.adjustments?.map((a: any) => ({ ...a, amount: Number(a.amount) })) ?? [],
	} as BookingWithDetails;
};

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
			this.prisma.event.count({ where: { occurrences: { some: { date: { gte: now } } } } }),
			this.prisma.event.count({ where: { occurrences: { some: { date: { gte: now, lte: weekFromNow } } } } }),
			this.prisma.event.count({ where: { occurrences: { none: { bookings: { some: {} } } } } }),
			this.prisma.eventOccurrence.aggregate({
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
					cancellationRules: true,
					translations: true,
					category: {
						include: {
							translations: true,
						},
					},
					occurrences: true,
					organizer: {
						select: safeUserSelect,
					},
				},
			}),
			this.prisma.event.findMany({
				take: 5,
				where: { occurrences: { some: { date: { gte: now } } } },
				orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
				include: {
					cancellationRules: true,
					translations: true,
					category: {
						include: {
							translations: true,
						},
					},
					occurrences: true,
					organizer: {
						select: safeUserSelect,
					},
				},
			}),
		]);

		// Calculate revenue from confirmed bookings
		const confirmedBookingsData = await this.prisma.booking.findMany({
			where: { status: 'CONFIRMED' },
			include: {
				occurrence: {
					select: { event: { select: { price: true } } },
				},
			},
		});

		const totalRevenue = confirmedBookingsData.reduce(
			(sum, booking) => sum + Number(booking.amount),
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
			recentBookings: recentBookings.map((b) => normalizeBookingResponse(b)),
			recentUsers,
			recentEvents: recentEvents.map((e) => ({
				...e,
				price: Number(e.price),
				cancellationRules: e.cancellationRules ?? [],
				occurrences: e.occurrences ?? [],
			})),
			upcomingEvents: upcomingEvents.map((e) => ({
				...e,
				price: Number(e.price),
				cancellationRules: e.cancellationRules ?? [],
				occurrences: e.occurrences ?? [],
			})),
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

	async updateUserRole(id: string, role: UserRoleType): Promise<SafeUserData> {
		const user = await this.prisma.user.update({
			where: { id },
			data: { role },
			select: safeUserSelect,
		});
		return user;
	}

	async findAllBookings({
		skip = 0,
		limit = 20,
		search,
		status,
		time,
		eventId,
	}: FindAllBookingsParams = {}) {
		const now = new Date();
		const where = {
			...(search
				? {
						OR: [
							{ user: { name: { contains: search, mode: 'insensitive' as const } } },
							{ user: { email: { contains: search, mode: 'insensitive' as const } } },
							{
								event: {
									translations: {
										some: {
											OR: [
												{ title: { contains: search, mode: 'insensitive' as const } },
												{ location: { contains: search, mode: 'insensitive' as const } },
											],
										},
									},
								},
							},
						],
					}
				: {}),
			...(status ? { status } : {}),
			...(time === 'upcoming' ? { occurrence: { date: { gte: now } } } : {}),
			...(time === 'completed' ? { occurrence: { date: { lt: now } } } : {}),
			...(eventId ? { occurrence: { eventId } } : {}),
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

		// Normalize decimals to plain numbers for JSON/clients
		const normalized = data.map((b) => normalizeBookingResponse(b));

		return {
			data: normalized,
			total,
			skip,
			take: limit,
			hasMore,
			nextSkip: hasMore ? skip + limit : null,
		};
	}

	async findBookingByReference(referenceNumber: number) {
		const booking = await this.prisma.booking.findUnique({
			where: { referenceNumber },
			include: bookingInclude,
		});
		if (!booking) throw new NotFoundException('Booking not found');
		return booking;
	}

	async checkInBooking(bookingId: string) {
		const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
		if (!booking) throw new NotFoundException('Booking not found');
		if (booking.status !== 'CONFIRMED') throw new ConflictException('Booking is not confirmed');
		if (booking.checkedInAt) throw new ConflictException('Already checked in');

		return this.prisma.booking.update({
			where: { id: bookingId },
			data: { checkedInAt: new Date() },
			include: bookingInclude,
		});
	}

	async updateBookingStatus(id: string, status: BookingStatus) {
		return this.prisma.$transaction(async (tx) => {
			const booking = await tx.booking.findUnique({
				where: { id },
				include: { occurrence: true },
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
				const reserved = await tx.eventOccurrence.updateMany({
					where: {
						id: booking.occurrenceId,
						currentParticipants: { lte: booking.occurrence.maxParticipants - participantDelta },
					},
					data: { currentParticipants: { increment: participantDelta } },
				});

				if (reserved.count === 0) {
					const spotsLeft = Math.max(
						0,
						booking.occurrence.maxParticipants - booking.occurrence.currentParticipants,
					);
					throw new ConflictException(
						spotsLeft === 0 ? 'No spots available' : `Only ${spotsLeft} spots available`,
					);
				}
			} else if (participantDelta < 0) {
				const releaseQty = -participantDelta;
				const released = await tx.eventOccurrence.updateMany({
					where: {
						id: booking.occurrenceId,
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
		minPrice,
		maxPrice,
	}: FindAllEventsParams = {}) {
		const now = new Date();
		const where = {
			...(search
				? {
						translations: {
							some: {
								OR: [
									{ title: { contains: search, mode: 'insensitive' as const } },
									{ description: { contains: search, mode: 'insensitive' as const } },
									{ location: { contains: search, mode: 'insensitive' as const } },
								],
							},
						},
					}
				: {}),
			...(status ? { status } : {}),
			...(difficulty ? { difficulty } : {}),
			...(time === 'upcoming' ? { occurrences: { some: { date: { gte: now } } } } : {}),
			...(time === 'completed' ? { occurrences: { some: { date: { lt: now } } } } : {}),
			...(minPrice !== undefined ? { price: { gte: minPrice } } : {}),
			...(maxPrice !== undefined ? { price: { lte: maxPrice } } : {}),
		};

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
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
					images: { orderBy: { order: 'asc' } },
					occurrences: true,
					category: { 
						include: { translations: true }
					 }
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

	async findAllCategories({
		skip = 0,
		limit = 20,
		search,
	}: PaginatedParams & { search?: string } = {}) {
		const where = {
			...(search
				? {
						translations: {
							some: {
								name: { contains: search, mode: 'insensitive' as const },
							},
						},
					}
				: {}),
		};

		const [categories, total] = await Promise.all([
			this.prisma.category.findMany({
				where,
				skip,
				take: limit + 1,
				orderBy: { createdAt: 'desc' },
				include: {
					translations: true,
				},
			}),
			this.prisma.category.count({ where }),
		]);

		const hasMore = categories.length > limit;
		const data = hasMore ? categories.slice(0, limit) : categories;

		return {
			data,
			total,
			skip,
			take: limit,
			hasMore,
			nextSkip: hasMore ? skip + limit : null,
		};
	}

	async createCategory(data: CreateCategoryData) {
		const { translations, ...pureData } = data;
		return this.prisma.category.create({
			data: {
				...pureData,
				translations: {
					create: translations,
				},
			},
			include: {
				translations: true,
			},
		});
	}

	async updateCategory(id: string, data: UpdateCategoryData) {
		const { translations, ...pureData } = data;
		return this.prisma.category.update({
			where: { id },
			data: {
				...pureData,
				...(translations !== undefined && {
					translations: {
						deleteMany: {},
						create: translations,
					},
				}),
			},
			include: {
				translations: true,
			},
		});
	}

	async deleteCategory(id: string) {
		return this.prisma.category.delete({
			where: { id },
			include: {
				translations: true,
			},
		});
	}
}
