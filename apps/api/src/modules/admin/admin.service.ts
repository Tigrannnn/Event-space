import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { StripeService } from '@infra/stripe/stripe.service';
import { AppException } from '@shared';
import {
	CANCELABLE_PAYMENT_INTENT_STATUSES,
	CancelablePaymentIntentStatus,
} from '@infra/stripe/stripe.types';
import { AppErrorCode } from '@event-space/shared';
import type {
    SafeUserData,
    UserRoleType,
	TimeFilterType,
	SpotsFilterType,
	EventStatus,
	EventDifficulty,
	BookingStatus,
	BookingStatusCounts,
	PaymentMethod,
	DashboardStats,
	PaginatedParams,
	CreateCategoryData,
	UpdateCategoryData,
	BookingWithDetails,
	AdminCancelBookingData,
	UpdateBookingData,
	Category,
} from '@event-space/shared';
import { isUuid } from '@event-space/shared';
import { buildOccurrenceDateFilter } from '@modules/event/event.utils';

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
					occurrences: {
						include: {
							_count: {
								select: {
									bookings: true,
								},
							},
						},
					},
				},
			},
		},
	},
	adjustments: true,
} as const;

/**
 * Turns a `YYYY-MM-DD` range into a Prisma filter covering whole days, so `createdTo` includes
 * everything that happened on that date rather than cutting off at midnight.
 */
function buildCreatedAtFilter(
	createdFrom?: string,
	createdTo?: string,
): { gte?: Date; lte?: Date } | undefined {
	if (!createdFrom && !createdTo) return undefined;

	return {
		...(createdFrom ? { gte: new Date(`${createdFrom}T00:00:00.000`) } : {}),
		...(createdTo ? { lte: new Date(`${createdTo}T23:59:59.999`) } : {}),
	};
}

interface FindAllUsersParams extends PaginatedParams {
	search?: string;
	role?: UserRoleType;
	emailVerified?: boolean;
	createdFrom?: string;
	createdTo?: string;
	isShadow?: boolean;
}

interface FindAllBookingsParams extends PaginatedParams {
	search?: string;
	status?: BookingStatus;
	time?: TimeFilterType;
	eventId?: string;
	createdFrom?: string;
	createdTo?: string;
	paymentMethod?: PaymentMethod;
}

interface FindAllEventsParams extends PaginatedParams {
	search?: string;
	status?: EventStatus;
	difficulty?: EventDifficulty;
	time?: TimeFilterType;
	minPrice?: number;
	maxPrice?: number;
	category?: string;
	/** `YYYY-MM-DD`, inclusive on both ends. */
	startDate?: string;
	endDate?: string;
	spots?: SpotsFilterType;
}

const emptyBookingStats = (): BookingStatusCounts => ({
	total: 0,
	pending: 0,
	confirmed: 0,
	cancelled: 0,
	expired: 0,
});

const BOOKING_STATUS_TO_STATS_KEY: Record<BookingStatus, keyof BookingStatusCounts> = {
	PENDING: 'pending',
	CONFIRMED: 'confirmed',
	CANCELLED: 'cancelled',
	EXPIRED: 'expired',
};

const addBookingStats = (target: BookingStatusCounts, source: BookingStatusCounts): void => {
	target.total += source.total;
	target.pending += source.pending;
	target.confirmed += source.confirmed;
	target.cancelled += source.cancelled;
	target.expired += source.expired;
};

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
	private readonly logger = new Logger(AdminService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
	) {}

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
			this.prisma.event.count({
				where: { occurrences: { some: { date: { gte: now, lte: weekFromNow } } } },
			}),
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
					// Sorted so the dashboard's "next date" is genuinely the nearest one — widgets read
					// occurrences[0] and would otherwise show whichever row the database returned first.
					occurrences: { orderBy: { date: 'asc' as const } },
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
					// Sorted so the dashboard's "next date" is genuinely the nearest one — widgets read
					// occurrences[0] and would otherwise show whichever row the database returned first.
					occurrences: { orderBy: { date: 'asc' as const } },
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
		createdFrom,
		createdTo,
		isShadow,
	}: FindAllUsersParams = {}) {
			const searchIsUuid = isUuid(search);
			const createdAt = buildCreatedAtFilter(createdFrom, createdTo);

			const where = {
				...(search
					? {
							OR: [
								...(searchIsUuid ? [{ id: search }] : []),
								{ name: { contains: search, mode: 'insensitive' as const } },
								{ email: { contains: search, mode: 'insensitive' as const } },
							],
						}
					: {}),
				...(role ? { role } : {}),
				...(typeof emailVerified === 'boolean' ? { emailVerified } : {}),
				...(typeof isShadow === 'boolean' ? { isShadow } : {}),
				...(createdAt ? { createdAt } : {}),
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

	async findOneBooking(id: string): Promise<BookingWithDetails | null> {
		const booking = await this.prisma.booking.findUnique({
			where: { id },
			include: bookingInclude,
		});

		if (!booking) return null;
		return normalizeBookingResponse(booking);
	}

	async findOneCategory(id: string): Promise<Category | null> {
		return this.prisma.category.findUnique({
			where: { id },
			include: { translations: true },
		});
	}

	async updateUserRole(id: string, role: UserRoleType): Promise<SafeUserData> {
		const user = await this.prisma.user.update({
			where: { id },
			data: { role },
			select: safeUserSelect,
		});
		return user;
	}

	async updateBooking(id: string, data: UpdateBookingData): Promise<BookingWithDetails> {
		const booking = await this.prisma.booking.findUnique({
			where: { id },
			include: bookingInclude,
		});

		if (!booking) {
			throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		}

		if (booking.status === 'CANCELLED') {
			throw new AppException(AppErrorCode.BOOKING_ALREADY_CANCELLED);
		}

		const currentQuantity = booking.quantity;
		const nextQuantity = data.quantity;
		const diff = nextQuantity - currentQuantity;

		if (diff === 0) {
			return normalizeBookingResponse(booking);
		}

		if (!booking.occurrence) {
			throw new AppException(AppErrorCode.OCCURRENCE_NOT_FOUND);
		}

		const event = booking.occurrence.event;
		if (!event) {
			throw new AppException(AppErrorCode.EVENT_NOT_FOUND);
		}

		const updatedBooking = await this.prisma.$transaction(async (tx) => {
			if (diff > 0) {
				const reserved = await tx.eventOccurrence.updateMany({
					where: {
						id: booking.occurrenceId,
						currentParticipants: { lte: booking.occurrence.maxParticipants - diff },
					},
					data: { currentParticipants: { increment: diff } },
				});

				if (reserved.count === 0) {
					const spotsLeft = Math.max(
						0,
						booking.occurrence.maxParticipants - booking.occurrence.currentParticipants,
					);
					throw spotsLeft === 0
						? new AppException(AppErrorCode.NO_SPOTS_AVAILABLE)
						: new AppException(AppErrorCode.NOT_ENOUGH_SPOTS, { spotsLeft });
				}
			} else {
				const released = await tx.eventOccurrence.updateMany({
					where: {
						id: booking.occurrenceId,
						currentParticipants: { gte: -diff },
					},
					data: { currentParticipants: { decrement: -diff } },
				});

				if (released.count === 0) {
					throw new AppException(AppErrorCode.UNABLE_TO_RELEASE_SPOTS);
				}
			}

			const amount = parseFloat((Number(event.price) * nextQuantity).toFixed(2));

			return tx.booking.update({
				where: { id },
				data: { quantity: nextQuantity, amount },
				include: bookingInclude,
			});
		});

		return normalizeBookingResponse(updatedBooking);
	}

	async adminCancelBooking(adminId: string, bookingId: string, data: AdminCancelBookingData) {
		const { refundType = 'RULES', reason } = data;

		const { booking, occurrence, event } = await this.prisma.$transaction(async (tx) => {
			const currentBooking = await tx.booking.findUnique({
				where: { id: bookingId },
				include: {
					occurrence: {
						include: { event: { include: { cancellationRules: true, translations: true } } },
					},
				},
			});

			if (!currentBooking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);

			if (currentBooking.status === 'CANCELLED') {
				return {
					booking: currentBooking,
					occurrence: currentBooking.occurrence,
					event: currentBooking.occurrence?.event,
				};
			}

			if (currentBooking.status === 'CONFIRMED') {
				await tx.eventOccurrence.updateMany({
					where: {
						id: currentBooking.occurrenceId,
						currentParticipants: { gte: currentBooking.quantity },
					},
					data: { currentParticipants: { decrement: currentBooking.quantity } },
				});
			}

			const updatedBooking = await tx.booking.update({
				where: { id: bookingId },
				data: { status: 'CANCELLED' },
			});

			return {
				booking: updatedBooking,
				occurrence: currentBooking.occurrence,
				event: currentBooking.occurrence?.event,
			};
		});

		if (!booking.paymentIntentId || Number(booking.amount) === 0) {
			return {
				booking: {
					...booking,
					amount: Number(booking.amount),
					status: 'CANCELLED',
				},
				refundType,
				reason: reason ?? null,
				processed: false,
				message: 'Booking cancelled without payment refund processing.',
			};
		}

		if (refundType === 'MANUAL') {
			await this.prisma.bookingAdjustment.upsert({
				where: {
					stripePaymentIntentId_type: {
						stripePaymentIntentId: booking.paymentIntentId,
						type: 'REFUND',
					},
				},
				create: {
					bookingId: booking.id,
					type: 'REFUND',
					amount: new Prisma.Decimal('0'),
					currency: 'AMD',
					stripePaymentIntentId: booking.paymentIntentId,
					stripeRefundId: null,
					status: 'PENDING',
					reason: `Manual refund requested by admin ${adminId}${reason ? `: ${reason}` : ''}`,
				},
				update: {
					status: 'PENDING',
					reason: `Manual refund requested by admin ${adminId}${reason ? `: ${reason}` : ''}`,
				},
			});

			return {
				booking: {
					...booking,
					amount: Number(booking.amount),
					status: 'CANCELLED',
				},
				refundType,
				reason: reason ?? null,
				processed: false,
				message: 'Booking cancelled. Refund will be handled manually.',
			};
		}

		if (!event) {
			this.logger.warn(
				`Event not found for booking ${bookingId} during admin cancel — skipping refund`,
			);
			return {
				booking: {
					...booking,
					amount: Number(booking.amount),
					status: 'CANCELLED',
				},
				refundType,
				reason: reason ?? null,
				processed: false,
				message: 'Booking cancelled without refund because event data is missing.',
			};
		}

		let refundResult: { amount: number; id: string } | null = null;
		let refundStatus: 'SUCCEEDED' | 'FAILED' = 'SUCCEEDED';

		try {
			const paymentIntent = await this.stripe.retrievePaymentIntent(booking.paymentIntentId);

			if (paymentIntent.status === 'succeeded') {
				const baseAmountInCents = Math.round(Number(booking.amount) * 100);
				const refundPercentage = this.calculateRefundPercentage(
					new Date(),
					new Date(occurrence?.date ?? new Date()),
					event.cancellationRules,
				);
				const refundAmountInCents =
					refundType === 'FULL'
						? baseAmountInCents
						: Math.round((baseAmountInCents * refundPercentage) / 100);

				if (refundAmountInCents > 0) {
					const refund = await this.stripe.refund(
						booking.paymentIntentId,
						`admin-refund-${booking.paymentIntentId}-${refundAmountInCents}`,
						refundType === 'FULL' ? baseAmountInCents : refundAmountInCents,
					);
					refundResult = { amount: refund.amount, id: refund.id };
				}
			} else if (
				CANCELABLE_PAYMENT_INTENT_STATUSES.includes(
					paymentIntent.status as CancelablePaymentIntentStatus,
				)
			) {
				await this.stripe.cancelPaymentIntent(
					booking.paymentIntentId,
					`admin-cancel-${booking.paymentIntentId}`,
				);
			}
		} catch (stripeError) {
			refundStatus = 'FAILED';
			this.logger.error(`Admin refund failed for booking ${bookingId}:`, stripeError);
		}

		if (refundResult) {
			await this.prisma.bookingAdjustment.upsert({
				where: {
					stripePaymentIntentId_type: {
						stripePaymentIntentId: booking.paymentIntentId,
						type: 'REFUND',
					},
				},
				create: {
					bookingId: booking.id,
					type: 'REFUND',
					amount: new Prisma.Decimal((refundResult.amount / 100).toString()),
					currency: 'AMD',
					stripePaymentIntentId: booking.paymentIntentId,
					stripeRefundId: refundResult.id,
					status: 'SUCCEEDED',
					reason: `Admin cancellation${reason ? `: ${reason}` : ''}`,
				},
				update: {
					stripeRefundId: refundResult.id,
					status: 'SUCCEEDED',
					reason: `Admin cancellation${reason ? `: ${reason}` : ''}`,
				},
			});
		} else if (booking.paymentIntentId) {
			await this.prisma.bookingAdjustment.upsert({
				where: {
					stripePaymentIntentId_type: {
						stripePaymentIntentId: booking.paymentIntentId,
						type: 'REFUND',
					},
				},
				create: {
					bookingId: booking.id,
					type: 'REFUND',
					amount: new Prisma.Decimal('0'),
					currency: 'AMD',
					stripePaymentIntentId: booking.paymentIntentId,
					stripeRefundId: null,
					status: refundStatus,
					reason: `Admin cancellation${reason ? `: ${reason}` : ''}`,
				},
				update: {
					status: refundStatus,
					reason: `Admin cancellation${reason ? `: ${reason}` : ''}`,
				},
			});
		}

		return {
			booking: {
				...booking,
				amount: Number(booking.amount),
				status: 'CANCELLED',
			},
			refundType,
			reason: reason ?? null,
			processed: refundResult !== null || refundStatus === 'FAILED' ? true : false,
			message:
				refundType === 'FULL'
					? 'Booking cancelled and refund processed.'
					: refundType === 'RULES'
						? 'Booking cancelled and refund processed according to cancellation rules.'
						: 'Booking cancelled. Refund will be handled manually.',
		};
	}

	async findAllBookings({
		skip = 0,
		limit = 20,
		search,
		status,
		time,
		eventId,
		createdFrom,
		createdTo,
		paymentMethod,
	}: FindAllBookingsParams = {}) {
		const now = new Date();
		const searchIsUuid = isUuid(search);
		const createdAt = buildCreatedAtFilter(createdFrom, createdTo);

		// `time` and `eventId` both constrain the related occurrence, so they have to be merged
		// into a single condition — spreading them as separate `occurrence` keys would leave only
		// the last one standing.
		const occurrence = {
			...(time === 'upcoming' ? { date: { gte: now } } : {}),
			...(time === 'completed' ? { date: { lt: now } } : {}),
			...(eventId ? { eventId } : {}),
		};

		const where = {
			...(search
				? {
						OR: [
							...(searchIsUuid ? [{ id: search }] : []),
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
			...(Object.keys(occurrence).length > 0 ? { occurrence } : {}),
			...(paymentMethod ? { paymentMethod } : {}),
			...(createdAt ? { createdAt } : {}),
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
		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		return booking;
	}

	async checkInBooking(bookingId: string) {
		const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (booking.status !== 'CONFIRMED') throw new AppException(AppErrorCode.BOOKING_NOT_CONFIRMED);
		if (booking.checkedInAt) throw new AppException(AppErrorCode.ALREADY_CHECKED_IN);

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
				throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
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
					throw spotsLeft === 0
						? new AppException(AppErrorCode.NO_SPOTS_AVAILABLE)
						: new AppException(AppErrorCode.NOT_ENOUGH_SPOTS, { spotsLeft });
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
					throw new AppException(AppErrorCode.UNABLE_TO_RELEASE_SPOTS);
				}
			}

			return tx.booking.update({
				where: { id },
				data: { status },
				include: bookingInclude,
			});
		});
	}

	private calculateRefundPercentage(
		now: Date,
		eventDate: Date,
		rules: Array<{ hoursBeforeEvent: number; refundPercentage: number }>,
	): number {
		const msLeft = eventDate.getTime() - now.getTime();
		const hoursLeft = msLeft / (1000 * 60 * 60);

		if (hoursLeft <= 0) return 0;

		const sortedRules = [...rules].sort((a, b) => b.hoursBeforeEvent - a.hoursBeforeEvent);

		for (const rule of sortedRules) {
			if (hoursLeft >= rule.hoursBeforeEvent) {
				return rule.refundPercentage;
			}
		}

		return rules.length > 0 ? 0 : 100;
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
		category,
		startDate,
		endDate,
		spots,
	}: FindAllEventsParams = {}) {
		const now = new Date();
		const searchIsUuid = isUuid(search);

		// `time` and the date range both constrain the same `occurrences` relation, so they are
		// merged into a single condition. Spread separately they would collide on the `occurrences`
		// key and the later one would silently drop the earlier filter — the same trap the price
		// bounds below are written around.
		const occurrenceDate: Prisma.DateTimeFilter = buildOccurrenceDateFilter(startDate, endDate) ?? {};

		if (time === 'upcoming') {
			// Whichever lower bound is stricter wins: an admin asking for August of next year and
			// "upcoming" wants August, not everything from today onwards.
			const rangeStart = occurrenceDate.gte as Date | undefined;
			occurrenceDate.gte = rangeStart && rangeStart > now ? rangeStart : now;
		}

		if (time === 'completed') {
			occurrenceDate.lt = now;
		}

		const hasOccurrenceFilter = Object.keys(occurrenceDate).length > 0;

		// Occupancy compares one column against another, which Prisma expresses as a field
		// reference. Keeping it in the query rather than filtering the fetched page in JS is what
		// keeps `total` and `hasMore` honest: a filter applied after `take` would report counts
		// that don't match the rows the table actually shows.
		const hasFreeSpot = { lt: this.prisma.eventOccurrence.fields.maxParticipants };

		// Every occurrence-level condition goes into the same `some`, so they all have to hold for
		// one and the same date. Split across two `some` clauses, "has a date in August" and "has a
		// date with room" would both pass for an event whose August date is sold out and whose
		// October date is empty.
		const occurrenceMatch: Prisma.EventOccurrenceWhereInput = {
			...(hasOccurrenceFilter ? { date: occurrenceDate } : {}),
			...(spots ? { status: 'ACTIVE' as const } : {}),
			...(spots === 'available' ? { currentParticipants: hasFreeSpot } : {}),
			...(spots === 'empty' ? { currentParticipants: 0 } : {}),
		};

		const hasOccurrenceMatch = Object.keys(occurrenceMatch).length > 0;

		// Both bounds constrain `price`, so they are built as one condition — as separate spreads
		// the upper bound would overwrite the lower and quietly widen the result.
		const price = {
			...(minPrice !== undefined ? { gte: minPrice } : {}),
			...(maxPrice !== undefined ? { lte: maxPrice } : {}),
		};

		const where = {
			...(search
				? {
						OR: [
							...(searchIsUuid ? [{ id: search }] : []),
							{
								translations: {
									some: {
										OR: [
											{ title: { contains: search, mode: 'insensitive' as const } },
											{ description: { contains: search, mode: 'insensitive' as const } },
											{ location: { contains: search, mode: 'insensitive' as const } },
										],
									},
								},
							},
						],
					}
				: {}),
			...(status ? { status } : {}),
			...(difficulty ? { difficulty } : {}),
			...(hasOccurrenceMatch ? { occurrences: { some: occurrenceMatch } } : {}),
			// "Sold out" is the absence of a sellable date among the ones already matched above,
			// so it rides on the same conditions rather than introducing its own.
			...(spots === 'full'
				? { NOT: { occurrences: { some: { ...occurrenceMatch, currentParticipants: hasFreeSpot } } } }
				: {}),
			...(category ? { category: { slug: category } } : {}),
			...(Object.keys(price).length > 0 ? { price } : {}),
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
							phone: true,
						},
					},
					images: { orderBy: { order: 'asc' } },
					occurrences: { orderBy: { date: 'asc' } },
					category: {
						include: { translations: true },
					},
				},
			}),
			this.prisma.event.count({ where }),
		]);

		const hasMore = events.length > limit;
		const data = hasMore ? events.slice(0, limit) : events;

		return {
			data: await this.attachBookingStats(data),
			total,
			skip,
			take: limit,
			hasMore,
			nextSkip: hasMore ? skip + limit : null,
		};
	}

	/**
	 * Adds a per-status booking breakdown to every occurrence, and the event-wide total.
	 *
	 * One grouped query covers the whole page rather than one per event. Prisma cannot
	 * express this through `_count`, which allows only a single filter per relation — the
	 * reason the old code could report just one status and left the rest invisible.
	 */
	private async attachBookingStats<
		T extends { id: string; occurrences: { id: string }[] },
	>(events: T[]): Promise<(T & { bookingStats: BookingStatusCounts })[]> {
		if (events.length === 0) return [];

		const grouped = await this.prisma.booking.groupBy({
			by: ['occurrenceId', 'status'],
			where: { occurrence: { eventId: { in: events.map((event) => event.id) } } },
			_count: { _all: true },
		});

		const statsByOccurrence = new Map<string, BookingStatusCounts>();
		for (const row of grouped) {
			let stats = statsByOccurrence.get(row.occurrenceId);
			if (!stats) {
				stats = emptyBookingStats();
				statsByOccurrence.set(row.occurrenceId, stats);
			}

			const count = row._count._all;
			stats[BOOKING_STATUS_TO_STATS_KEY[row.status]] += count;
			stats.total += count;
		}

		return events.map((event) => {
			const eventStats = emptyBookingStats();

			const occurrences = event.occurrences.map((occurrence) => {
				const stats = statsByOccurrence.get(occurrence.id) ?? emptyBookingStats();
				addBookingStats(eventStats, stats);
				return { ...occurrence, bookingStats: stats };
			});

			return { ...event, occurrences, bookingStats: eventStats };
		});
	}

	async findAllCategories({
		skip = 0,
		limit = 20,
		search,
	}: PaginatedParams & { search?: string } = {}) {
		const searchIsUuid = isUuid(search);

		const where = {
			...(search
				? {
						OR: [
							...(searchIsUuid ? [{ id: search }] : []),
							{
								translations: {
									some: {
										name: { contains: search, mode: 'insensitive' as const },
									},
								},
							},
						],
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
