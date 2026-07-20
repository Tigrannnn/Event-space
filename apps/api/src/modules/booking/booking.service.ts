import {
	Injectable,
	NotFoundException,
	ConflictException,
	ForbiddenException,
	ServiceUnavailableException,
	Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
	CancellationPolicyRule,
	BookingWithEstimate,
	BookingWithOccurrence,
	estimateStripeFeeInCents,
	isEventAvailable,
	CreateBookingData,
	CreateManualBookingData,
} from '@event-space/shared';
import { StripeService } from '@infra/stripe/stripe.service';
import {
	CANCELABLE_PAYMENT_INTENT_STATUSES,
	CancelablePaymentIntentStatus,
	StripeBalanceTransaction,
	StripePaymentIntent,
} from '@infra/stripe/stripe.types';
import { getNextBookingReference } from './booking-reference';

@Injectable()
export class BookingService {
	private readonly logger = new Logger(BookingService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
	) {}

	async create(userId: string, data: CreateBookingData) {
		const { occurrenceId, quantity = 1, phone } = data;

		const { booking, event, occurrence } = await this.prisma.$transaction(async (tx) => {
			// Load the specific occurrence by id and include its event
			const occurrence = await tx.eventOccurrence.findUnique({
				where: { id: occurrenceId },
				include: {
					event: {
						include: {
							cancellationRules: true,
							translations: true,
							category: { include: { translations: true } },
							occurrences: true,
							images: true,
						},
					},
				},
			});

			if (!occurrence) throw new NotFoundException('Occurrence not found');

			const event = occurrence.event;
			if (!event) throw new NotFoundException('Event not found');
			// Ensure the event and occurrence are bookable (published and in the future)
			if (event.status !== 'PUBLISHED' || new Date(occurrence.date) <= new Date()) {
				throw new ForbiddenException('Event is not available for booking');
			}

			const existing = await tx.booking.findUnique({
				where: { userId_occurrenceId: { userId, occurrenceId: occurrence.id } },
			});
			if (existing && existing.status === 'CONFIRMED') {
				throw new ConflictException('Already booked');
			}

			if (occurrence.currentParticipants > occurrence.maxParticipants - quantity) {
				const spotsLeft = Math.max(0, occurrence.maxParticipants - occurrence.currentParticipants);
				throw new ConflictException(
					spotsLeft === 0 ? 'No spots available' : `Only ${spotsLeft} spots available`,
				);
			}

			// Update user with phone if provided and user doesn't have it yet
			if (phone) {
				await tx.user.update({
					where: { id: userId },
					data: { phone: { set: phone } },
				});
			}

			const amount = parseFloat((Number(event.price) * quantity).toFixed(2));

			const upserted = await tx.booking.upsert({
				where: { userId_occurrenceId: { userId, occurrenceId: occurrence.id } },
				update: { status: 'PENDING', expired: false, quantity, paymentIntentId: null, amount },
				create: {
					userId,
					occurrenceId: occurrence.id,
					status: 'PENDING',
					expired: false,
					quantity,
					amount,
				},
			});

			return { booking: upserted, event, occurrence };
		});

		let paymentIntent: StripePaymentIntent | null = null;
		try {
			// TODO: remove AMD hardcoding
			paymentIntent = await this.stripe.createPaymentIntent(Number(booking.amount), 'AMD', {
				userId,
				occurrenceId,
				bookingId: booking.id,
			});

			const updatedBooking = await this.prisma.booking.update({
				where: { id: booking.id },
				data: { paymentIntentId: paymentIntent.id },
			});

			const refundPercentage = this.calculateRefundPercentage(
				new Date(),
				new Date(occurrence.date),
				event.cancellationRules,
			);
			const estimatedStripeFeeInCents = estimateStripeFeeInCents(Number(updatedBooking.amount));
			const baseAmountInCents = Math.round(Number(updatedBooking.amount) * 100);
			const estimatedRefundInCents = Math.max(
				0,
				Math.round((baseAmountInCents * refundPercentage) / 100) - estimatedStripeFeeInCents,
			);

			const bookingWithEstimate = {
				...updatedBooking,
				amount: Number(updatedBooking.amount),
				occurrence: this.mapOccurrenceForBookingResponse(occurrence),
				refundPercentage,
				estimatedStripeFeeInCents,
				estimatedRefundInCents,
			} satisfies BookingWithEstimate;

			return {
				booking: bookingWithEstimate,
				clientSecret: paymentIntent.client_secret,
			};
		} catch (error) {
			if (paymentIntent) {
				try {
					await this.stripe.cancelPaymentIntent(paymentIntent.id);
				} catch (e) {
					this.logger.error('Failed to cancel payment intent after booking creation error', e as Error);
				}
			}

			await this.cancelPendingBooking(booking.id);
			this.rethrowStripeError(error);
		}
	}

	async createManualBooking(adminId: string, data: CreateManualBookingData) {
		const { occurrenceId, quantity = 1, userId, name, paymentMethod, email } = data;

		const result = await this.prisma.$transaction(async (tx) => {
			const occurrence = await tx.eventOccurrence.findUnique({
				where: { id: occurrenceId },
				include: {
					event: {
						include: {
							cancellationRules: true,
							translations: true,
							category: { include: { translations: true } },
							occurrences: true,
							images: true,
						},
					},
				},
			});
			if (!occurrence) throw new NotFoundException('Occurrence not found');

			const event = occurrence.event;
			if (!event) throw new NotFoundException('Event not found');
			if (event.status !== 'PUBLISHED' || new Date(occurrence.date) <= new Date()) {
				throw new ForbiddenException('Event is not available for booking');
			}

			let targetUserId = userId;
			let cancelledPaymentIntentId: string | null = null;

			if (name) {
				const shadowUser = await tx.user.create({
					data: {
						email,
						name,
						isShadow: true,
						emailVerified: false,
					},
				});
				targetUserId = shadowUser.id;
			}

			if (!targetUserId) {
				throw new ConflictException('userId or name is required');
			}

			const existing = await tx.booking.findUnique({
				where: { userId_occurrenceId: { userId: targetUserId, occurrenceId: occurrence.id } },
			});

			if (existing && existing.status === 'CONFIRMED') {
				throw new ConflictException('User already has a confirmed booking for this occurrence');
			}

			if (existing?.paymentIntentId) {
				cancelledPaymentIntentId = existing.paymentIntentId;
			}

			const reserved = await tx.eventOccurrence.updateMany({
				where: {
					id: occurrence.id,
					currentParticipants: { lte: occurrence.maxParticipants - quantity },
				},
				data: { currentParticipants: { increment: quantity } },
			});

			if (reserved.count === 0) {
				const spotsLeft = Math.max(0, occurrence.maxParticipants - occurrence.currentParticipants);
				throw new ConflictException(
					spotsLeft === 0 ? 'No spots available' : `Only ${spotsLeft} spots available`,
				);
			}

			const amount = parseFloat((Number(event.price) * quantity).toFixed(2));

			const referenceNumber = existing?.referenceNumber ?? (await getNextBookingReference(tx));

			const bookingData = {
				status: 'CONFIRMED' as const,
				quantity,
				amount,
				paymentIntentId: null,
				paymentMethod,
				createdByAdminId: adminId,
				referenceNumber,
			};

			const booking = await tx.booking.upsert({
				where: { userId_occurrenceId: { userId: targetUserId, occurrenceId: occurrence.id } },
				update: bookingData,
				create: {
					userId: targetUserId,
					occurrenceId: occurrence.id,
					...bookingData,
				},
			});

			return { booking, cancelledPaymentIntentId, event, occurrence };
		});

		if (result.cancelledPaymentIntentId) {
			try {
				await this.stripe.cancelPaymentIntent(
					result.cancelledPaymentIntentId,
					`manual-override-${result.booking.id}`,
				);
			} catch (e) {
				this.logger.warn(
					`Failed to cancel orphaned payment intent ${result.cancelledPaymentIntentId} for booking ${result.booking.id}`,
					e as Error,
				);
			}
		}

		return {
			...result.booking,
			amount: Number(result.booking.amount),
			occurrence: this.mapOccurrenceForBookingResponse(result.occurrence),
			refundPercentage: 0,
			estimatedStripeFeeInCents: 0,
			estimatedRefundInCents: 0,
		} satisfies BookingWithEstimate;
	}
	// 			throw new ConflictException('Cannot update cancelled booking');
	// 		}

	// 		const diff = quantity - booking.quantity;
	// 		if (diff === 0) return booking;

	// 		if (diff > 0) {
	// 			const event = await tx.event.findUnique({ where: { id: booking.eventId } });
	// 			if (!event) throw new NotFoundException('Event not found');

	// 			const reserved = await tx.event.updateMany({
	// 				where: {
	// 					id: booking.eventId,
	// 					status: 'PUBLISHED',
	// 					currentParticipants: { lte: event.maxParticipants - diff },
	// 				},
	// 				data: { currentParticipants: { increment: diff } },
	// 			});

	// 			if (reserved.count === 0) {
	// 				const spotsLeft = Math.max(0, event.maxParticipants - event.currentParticipants);
	// 				throw new ConflictException(
	// 					spotsLeft === 0 ? 'No spots available' : `Only ${spotsLeft} spots available`,
	// 				);
	// 			}
	// 		} else {
	// 			const released = await tx.event.updateMany({
	// 				where: {
	// 					id: booking.eventId,
	// 					currentParticipants: { gte: -diff },
	// 				},
	// 				data: { currentParticipants: { decrement: -diff } },
	// 			});

	// 			if (released.count === 0) {
	// 				throw new ConflictException('Unable to release spots');
	// 			}
	// 		}

	// 		return tx.booking.update({ where: { id: bookingId }, data: { quantity } });
	// 	});
	// }

	async findByUser(userId: string): Promise<BookingWithEstimate[]> {
		const bookings = await this.prisma.booking.findMany({
			where: { userId, status: { not: { in: ['EXPIRED', 'PENDING'] } } },
			include: {
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
				user: {
					select: {
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
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});

		const now = new Date();
		const enrichedBookings = await Promise.all(
			bookings.map(async (booking) => {
				const occurrence = booking.occurrence;
				const event = occurrence?.event;
				if (!event || !booking.paymentIntentId || Number(booking.amount) === 0) {
					return {
						...booking,
						amount: Number(booking.amount),
						occurrence: undefined,
						refundPercentage: 0,
						estimatedStripeFeeInCents: 0,
						estimatedRefundInCents: 0,
					} as BookingWithEstimate;
				}

				let stripeFeeInCents = 0;
				try {
					const paymentIntent = await this.stripe.retrievePaymentIntent(booking.paymentIntentId);
					if (paymentIntent.status === 'succeeded' && paymentIntent.latest_charge) {
						const charge = await this.stripe.getCharge(paymentIntent.latest_charge as string);
						const balanceTx = charge.balance_transaction as StripeBalanceTransaction;
						if (balanceTx && typeof balanceTx === 'object' && 'fee' in balanceTx) {
							stripeFeeInCents = balanceTx.fee;
						}
					}
				} catch (error) {
					this.logger.warn(`Failed to get Stripe fee for booking ${booking.id}, using estimate`, error);
				}

				const refundPercentage = this.calculateRefundPercentage(
					now,
					new Date(occurrence.date),
					event.cancellationRules,
				);
				const baseAmountInCents = Math.round(Number(booking.amount) * 100);
				const calculatedRefundInCents = Math.round((baseAmountInCents * refundPercentage) / 100);

				const estimatedStripeFeeInCents =
					stripeFeeInCents > 0 ? stripeFeeInCents : estimateStripeFeeInCents(Number(booking.amount));

				const estimatedRefundInCents = Math.max(0, calculatedRefundInCents - estimatedStripeFeeInCents);

				return {
					...booking,
					amount: Number(booking.amount),
					occurrence: this.mapOccurrenceForBookingResponse(occurrence),
					refundPercentage,
					estimatedStripeFeeInCents,
					estimatedRefundInCents,
				} as BookingWithEstimate;
			}),
		);

		return enrichedBookings;
	}

	async findOneForUser(userId: string, bookingId: string) {
		const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });

		if (!booking) throw new NotFoundException('Booking not found');
		if (booking.userId !== userId) throw new ForbiddenException('Not your booking');

		return booking;
	}

	async cancel(userId: string, bookingId: string) {
		const { booking, occurrence, event } = await this.prisma.$transaction(async (tx) => {
			const currentBooking = await tx.booking.findUnique({
				where: { id: bookingId },
				include: {
					occurrence: {
						include: {
							event: {
								include: {
									cancellationRules: true,
									translations: true,
									category: { include: { translations: true } },
									occurrences: true,
								},
							},
						},
					},
				},
			});

			if (!currentBooking) throw new NotFoundException('Booking not found');
			if (currentBooking.userId !== userId) throw new ForbiddenException('Not your booking');
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
			return booking;
		}

		if (!event) {
			this.logger.warn(`Event not found for booking ${bookingId} during cancel — skipping refund`);
			return booking;
		}

		let refundResult: { amount: number; id: string } | null = null;

		try {
			const paymentIntent = await this.stripe.retrievePaymentIntent(booking.paymentIntentId);

			if (paymentIntent.status === 'succeeded') {
				const occurrenceDate = occurrence?.date ?? new Date();
				const refundPercentage = this.calculateRefundPercentage(
					new Date(),
					new Date(occurrenceDate),
					event.cancellationRules,
				);

				if (refundPercentage > 0) {
					const charge = await this.stripe.getCharge(paymentIntent.latest_charge as string);
					const balanceTx = charge.balance_transaction as StripeBalanceTransaction;
					const stripeFeeInCents = balanceTx.fee;

					const baseAmountInCents = Math.round(Number(booking.amount) * 100);
					const calculatedRefundInCents = Math.round((baseAmountInCents * refundPercentage) / 100);

					const finalRefundAmountInCents = calculatedRefundInCents - stripeFeeInCents;

					if (finalRefundAmountInCents > 0) {
						const refund = await this.stripe.refund(
							booking.paymentIntentId,
							`refund-${booking.paymentIntentId}-${finalRefundAmountInCents}`,
							finalRefundAmountInCents,
						);
						refundResult = { amount: refund.amount, id: refund.id };
					}
				}
			} else if (
				CANCELABLE_PAYMENT_INTENT_STATUSES.includes(
					paymentIntent.status as CancelablePaymentIntentStatus,
				)
			) {
				await this.stripe.cancelPaymentIntent(
					booking.paymentIntentId,
					`cancel-${booking.paymentIntentId}`,
				);
			}
		} catch (stripeError) {
			this.logger.error(`Stripe refund failed for booking ${bookingId}:`, stripeError);
		}

		if (refundResult) {
			await this.prisma.bookingAdjustment.upsert({
				where: { stripePaymentIntentId: booking.paymentIntentId },
				create: {
					bookingId: booking.id,
					type: 'REFUND',
					amount: new Prisma.Decimal((refundResult.amount / 100).toString()),
					currency: 'AMD',
					stripePaymentIntentId: booking.paymentIntentId,
					stripeRefundId: refundResult.id,
					status: 'SUCCEEDED',
					reason: 'Booking cancelled. Stripe fee withheld.',
				},
				update: {
					stripeRefundId: refundResult.id,
					status: 'SUCCEEDED',
				},
			});
		} else if (booking.paymentIntentId) {
			await this.prisma.bookingAdjustment.upsert({
				where: { stripePaymentIntentId: booking.paymentIntentId },
				create: {
					bookingId: booking.id,
					type: 'REFUND',
					amount: new Prisma.Decimal('0'),
					currency: 'AMD',
					stripePaymentIntentId: booking.paymentIntentId,
					stripeRefundId: null,
					status: 'SUCCEEDED',
				},
				update: {
					status: 'SUCCEEDED',
				},
			});
		}

		return booking;
	}

	async cancelEventBookings(eventId: string): Promise<void> {
		const { bookings, occurrences } = await this.prisma.$transaction(async (tx) => {
			// Get all confirmed and pending bookings for the event through occurrences
			const bookings = await tx.booking.findMany({
				where: {
					occurrence: { eventId },
					status: { in: ['PENDING', 'CONFIRMED'] },
				},
				include: { user: true },
			});

			// Update all bookings to CANCELLED
			await tx.booking.updateMany({
				where: {
					occurrence: { eventId },
					status: { in: ['PENDING', 'CONFIRMED'] },
				},
				data: { status: 'CANCELLED' },
			});

			const occurrences = await tx.eventOccurrence.updateMany({
				where: { eventId },
				data: { currentParticipants: 0 },
			});

			return { bookings, occurrences };
		});

		// Process refunds for each booking
		for (const booking of bookings) {
			if (!booking.paymentIntentId || Number(booking.amount) === 0) {
				continue;
			}

			let refundResult: { amount: number; id: string } | null = null;

			try {
				const paymentIntent = await this.stripe.retrievePaymentIntent(booking.paymentIntentId);

				if (paymentIntent.status === 'succeeded') {
					// Full 100% refund, no fee deduction
					const baseAmountInCents = Math.round(Number(booking.amount) * 100);

					if (baseAmountInCents > 0) {
						const refund = await this.stripe.refund(
							booking.paymentIntentId,
							`event-cancel-${eventId}-${booking.id}`,
							baseAmountInCents,
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
						`event-cancel-${eventId}-${booking.id}`,
					);
				}
			} catch (stripeError) {
				this.logger.error(
					`Stripe refund failed for booking ${booking.id} (event cancellation):`,
					stripeError,
				);
			}

			if (refundResult) {
				await this.prisma.bookingAdjustment.upsert({
					where: { stripePaymentIntentId: booking.paymentIntentId },
					create: {
						bookingId: booking.id,
						type: 'REFUND',
						amount: new Prisma.Decimal((refundResult.amount / 100).toString()),
						currency: 'AMD',
						stripePaymentIntentId: booking.paymentIntentId,
						stripeRefundId: refundResult.id,
						status: 'SUCCEEDED',
						reason: 'Event cancelled. Full refund.',
					},
					update: {
						stripeRefundId: refundResult.id,
						status: 'SUCCEEDED',
					},
				});
			} else if (booking.paymentIntentId) {
				await this.prisma.bookingAdjustment.upsert({
					where: { stripePaymentIntentId: booking.paymentIntentId },
					create: {
						bookingId: booking.id,
						type: 'REFUND',
						amount: new Prisma.Decimal('0'),
						currency: 'AMD',
						stripePaymentIntentId: booking.paymentIntentId,
						stripeRefundId: null,
						status: 'SUCCEEDED',
					},
					update: {
						status: 'SUCCEEDED',
					},
				});
			}
		}
	}

	private mapOccurrenceForBookingResponse(
		occurrence: Prisma.EventOccurrenceGetPayload<{
			include: {
				event: {
					include: {
						images: true;
						cancellationRules: true;
						translations: true;
						category: { include: { translations: true } };
						occurrences: true;
					};
				};
			};
		}>,
	) {
		return {
			...occurrence,
			event: this.mapEventForBookingResponse(occurrence.event),
		};
	}

	private mapEventForBookingResponse(
		event: Prisma.EventGetPayload<{
			include: {
				images: true;
				cancellationRules: true;
				translations: true;
				category: { include: { translations: true } };
				occurrences: true;
			};
		}>,
	) {
		return {
			...event,
			price: Number(event.price),
			images: event.images ?? [],
			cancellationRules: event.cancellationRules ?? [],
			translations: event.translations ?? [],
			category: event.category,
			occurrences: event.occurrences ?? [],
			locationUrl: event.locationUrl ?? null,
		};
	}

	private calculateRefundPercentage(
		now: Date,
		eventDate: Date,
		rules: CancellationPolicyRule[],
	): number {
		const msLeft = eventDate.getTime() - now.getTime();
		const hoursLeft = msLeft / (1000 * 60 * 60); // ms to hours

		if (hoursLeft <= 0) return 0;

		const sortedRules = [...rules].sort((a, b) => b.hoursBeforeEvent - a.hoursBeforeEvent);

		for (const rule of sortedRules) {
			if (hoursLeft >= rule.hoursBeforeEvent) {
				return rule.refundPercentage;
			}
		}

		return rules.length > 0 ? 0 : 100;
	}

	private async cancelPendingBooking(bookingId: string): Promise<void> {
		await this.prisma.booking.update({
			where: { id: bookingId },
			data: { status: 'CANCELLED', paymentIntentId: null },
		});
	}

	private rethrowStripeError(error: unknown): never {
		if (
			error &&
			typeof error === 'object' &&
			'type' in error &&
			(error as { type: string }).type === 'StripeConnectionError'
		) {
			throw new ServiceUnavailableException(
				'Payment service is unavailable. Check your internet connection and try again.',
			);
		}

		throw error;
	}
}
