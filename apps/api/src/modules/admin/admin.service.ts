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
	EventStatus,
	EventDifficulty,
	BookingStatus,
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
									bookings: {
										where: { status: 'CONFIRMED' },
									},
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
					occurrences: {
						include: {
							_count: {
								select: {
									bookings: {
										where: { status: 'CONFIRMED' },
									},
								},
							},
						},
					},
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
					occurrences: {
						include: {
							_count: {
								select: {
									bookings: {
										where: { status: 'CONFIRMED' },
									},
								},
							},
						},
					},
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
			const searchIsUuid = isUuid(search);

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
	}: FindAllBookingsParams = {}) {
		const now = new Date();
		const searchIsUuid = isUuid(search);

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
	}: FindAllEventsParams = {}) {
		const now = new Date();
		const searchIsUuid = isUuid(search);

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
							phone: true,
						},
					},
					images: { orderBy: { order: 'asc' } },
					occurrences: {
						orderBy: { date: 'asc' },
						include: {
							_count: {
								select: {
									bookings: {
										where: { status: 'CONFIRMED' },
									},
								},
							},
						},
					},
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
