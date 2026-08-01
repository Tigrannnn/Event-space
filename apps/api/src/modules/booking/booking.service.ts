import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
	AppErrorCode,
	BookingWithEstimate,
	estimateStripeFeeInCents,
	CreateBookingData,
	CreateManualBookingData,
} from '@event-space/shared';
import { AppException } from '@shared';
import { StripeService } from '@infra/stripe/stripe.service';
import { MailService } from '@infra/mail/mail.service';
import { calculateRefundPercentage, mapOccurrenceForBookingResponse } from './booking.utils';
import {
	CANCELABLE_PAYMENT_INTENT_STATUSES,
	CancelablePaymentIntentStatus,
	StripeBalanceTransaction,
	StripePaymentIntent,
	StripePaymentIntentRetrieve,
} from '@infra/stripe/stripe.types';
import { getNextBookingReference } from './booking-reference';

@Injectable()
export class BookingService {
	private readonly logger = new Logger(BookingService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
		private readonly mailService: MailService,
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

			if (!occurrence) throw new AppException(AppErrorCode.OCCURRENCE_NOT_FOUND, { id: occurrenceId });

			const event = occurrence.event;
			if (!event) throw new AppException(AppErrorCode.EVENT_NOT_FOUND);
			// Ensure the event and occurrence are bookable (published and in the future)
			if (
				event.status !== 'PUBLISHED' ||
				occurrence.status !== 'ACTIVE' ||
				new Date(occurrence.date) <= new Date()
			) {
				throw new AppException(AppErrorCode.EVENT_NOT_AVAILABLE_FOR_BOOKING);
			}

			const existing = await tx.booking.findUnique({
				where: { userId_occurrenceId: { userId, occurrenceId: occurrence.id } },
			});
			if (existing && existing.status === 'CONFIRMED') {
				throw new AppException(AppErrorCode.ALREADY_BOOKED);
			}

			if (occurrence.currentParticipants > occurrence.maxParticipants - quantity) {
				const spotsLeft = Math.max(0, occurrence.maxParticipants - occurrence.currentParticipants);
				throw spotsLeft === 0
					? new AppException(AppErrorCode.NO_SPOTS_AVAILABLE)
					: new AppException(AppErrorCode.NOT_ENOUGH_SPOTS, { spotsLeft });
			}

			// Update user with phone if provided and user doesn't have it yet
			if (phone) {
				await tx.user.update({
					where: { id: userId },
					data: { phone: { set: phone } },
				});
			}

			const amount = parseFloat((Number(event.price) * quantity).toFixed(2));

			// Re-booking reuses the same row (unique [userId, occurrenceId]). A payment intent
			// left over from a finished cycle may already be paid — and even refunded — so
			// carrying it into a new attempt would confirm this booking without payment.
			// Only a still-PENDING booking is in the same cycle and may keep its intent.
			const keepsPaymentIntent = existing?.status === 'PENDING';

			const upserted = await tx.booking.upsert({
				where: { userId_occurrenceId: { userId, occurrenceId: occurrence.id } },
				update: {
					status: 'PENDING',
					expired: false,
					quantity,
					amount,
					...(keepsPaymentIntent ? {} : { paymentIntentId: null }),
				},
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
		let clientSecret: string | null = null;
		try {
			// If a pending booking already has a payment intent, reuse it when possible.
			if (booking.paymentIntentId) {
				const existingIntent = await this.stripe.retrievePaymentIntent(booking.paymentIntentId);
				if (
					existingIntent.status === 'requires_confirmation' ||
					existingIntent.status === 'requires_action' ||
					existingIntent.status === 'processing' ||
					existingIntent.status === 'requires_capture'
				) {
					paymentIntent = existingIntent;
					clientSecret = existingIntent.client_secret;
				} else if (existingIntent.status === 'succeeded') {
					const reconciled = await this.reconcilePayment(existingIntent.id, booking.id);
					return {
						booking: reconciled ?? booking,
						clientSecret: null,
					};
				}
			}

			if (!paymentIntent) {
				// TODO: remove AMD hardcoding
				paymentIntent = await this.stripe.createPaymentIntent(Number(booking.amount), 'AMD', {
					userId,
					occurrenceId,
					bookingId: booking.id,
				});
				clientSecret = paymentIntent.client_secret;

				if (booking.paymentIntentId && booking.paymentIntentId !== paymentIntent.id) {
					try {
						await this.stripe.cancelPaymentIntent(booking.paymentIntentId, `replace-${booking.id}`);
					} catch (e) {
						this.logger.warn(
							`Failed to cancel stale payment intent ${booking.paymentIntentId} for booking ${booking.id}`,
							e as Error,
						);
					}
				}
			}

			const updatedBooking = await this.prisma.booking.update({
				where: { id: booking.id },
				data: { paymentIntentId: paymentIntent.id },
			});

			const refundPercentage = calculateRefundPercentage(
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
				occurrence: mapOccurrenceForBookingResponse(occurrence),
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

	async reconcilePayment(paymentIntentId: string, bookingIdHint?: string) {
		const paymentIntent = await this.stripe.retrievePaymentIntent(paymentIntentId);
		const amountReceived = paymentIntent.amount_received ?? paymentIntent.amount;

		const result = await this.prisma.$transaction(async (tx) => {
			let booking = bookingIdHint
				? await tx.booking.findUnique({
						where: { id: bookingIdHint },
						include: { occurrence: { select: { maxParticipants: true, currentParticipants: true } } },
					})
				: null;

			if (!booking) {
				booking = await tx.booking.findFirst({
					where: { paymentIntentId },
					include: { occurrence: { select: { maxParticipants: true, currentParticipants: true } } },
				});
			}

			if (!booking) {
				this.logger.warn(`Unable to reconcile payment intent ${paymentIntentId}: booking not found`);
				return { action: 'skipped' as const };
			}

			if (!booking.paymentIntentId) {
				await tx.booking.update({
					where: { id: booking.id },
					data: { paymentIntentId },
				});
				booking.paymentIntentId = paymentIntentId;
			}

			if (booking.status === 'CONFIRMED') {
				this.logger.log(`Booking ${booking.id} already confirmed`);
				return { action: 'skipped' as const, booking };
			}

			if (paymentIntent.status === 'succeeded') {
				if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
					await tx.booking.update({
						where: { id: booking.id },
						data: { paymentIntentId },
					});
					return {
						action: 'refund' as const,
						bookingId: booking.id,
						paymentIntentId,
						amountReceived,
						reason:
							booking.status === 'CANCELLED'
								? 'Payment captured after booking was cancelled.'
								: 'Payment captured after booking expired.',
						idempotencyKey: `auto-refund-${booking.id}`,
					};
				}

				// One payment intent can only fund one confirmation. If an adjustment already
				// settled it, this is a stale intent from an earlier cycle — possibly already
				// refunded — and confirming again would hand out a free booking.
				const settled = await tx.bookingAdjustment.findFirst({
					where: { stripePaymentIntentId: paymentIntentId },
					select: { id: true, bookingId: true, type: true },
				});

				if (settled) {
					this.logger.warn(
						`Refusing to confirm booking ${booking.id}: payment intent ${paymentIntentId} was already settled by ${settled.type} adjustment ${settled.id} (booking ${settled.bookingId})`,
					);
					return { action: 'skipped' as const };
				}

				const reserved = await tx.eventOccurrence.updateMany({
					where: {
						id: booking.occurrenceId,
						currentParticipants: { lte: booking.occurrence.maxParticipants - booking.quantity },
					},
					data: { currentParticipants: { increment: booking.quantity } },
				});

				if (reserved.count === 0) {
					await tx.booking.update({
						where: { id: booking.id },
						data: { status: 'CANCELLED', paymentIntentId },
					});
					return {
						action: 'refund' as const,
						bookingId: booking.id,
						paymentIntentId,
						amountReceived,
						reason: 'NO_SPOTS_LEFT',
						idempotencyKey: `auto-refund-no-spots-${booking.id}`,
					};
				}

				const referenceNumber = await getNextBookingReference(tx);
				const confirmedBooking = await tx.booking.update({
					where: { id: booking.id },
					data: { status: 'CONFIRMED', paymentIntentId, referenceNumber },
				});

				await tx.bookingAdjustment.create({
					data: {
						bookingId: booking.id,
						type: 'CHARGE',
						amount: new Prisma.Decimal(booking.amount.toString()),
						currency: 'AMD',
						stripePaymentIntentId: paymentIntentId,
						status: 'SUCCEEDED',
						reason: 'Payment captured',
					},
				});

				return { action: 'confirmed' as const, booking: confirmedBooking };
			}

			if (paymentIntent.status === 'canceled' || paymentIntent.status === 'requires_payment_method') {
				if (booking.status === 'PENDING') {
					const cancelledBooking = await tx.booking.update({
						where: { id: booking.id },
						data: { status: 'CANCELLED' },
					});

					return { action: 'cancelled' as const, booking: cancelledBooking };
				}

				return { action: 'cancelled' as const, booking };
			}

			return { action: 'pending' as const, booking };
		});

		if (result.action === 'confirmed') {
			await this.sendConfirmationSafely(result.booking.id);
		}

		if (result.action === 'refund') {
			try {
				const stripeRefund = await this.stripe.refund(
					result.paymentIntentId,
					result.idempotencyKey,
					result.amountReceived,
				);

				await this.prisma.bookingAdjustment.upsert({
					where: {
						stripePaymentIntentId_type: {
							stripePaymentIntentId: result.paymentIntentId,
							type: 'REFUND',
						},
					},
					create: {
						bookingId: result.bookingId,
						type: 'REFUND',
						amount: new Prisma.Decimal((stripeRefund.amount / 100).toString()),
						currency: 'AMD',
						stripePaymentIntentId: result.paymentIntentId,
						stripeRefundId: stripeRefund.id,
						status: 'SUCCEEDED',
						reason: result.reason,
					},
					update: {
						stripeRefundId: stripeRefund.id,
						status: 'SUCCEEDED',
						reason: result.reason,
					},
				});
			} catch (e) {
				this.logger.error(`Failed to auto-refund booking ${result.bookingId}`, e as Error);
			}
		}

		return result.action === 'skipped' ? null : result.booking;
	}

	async createManualBooking(adminId: string, data: CreateManualBookingData) {
		const { occurrenceId, quantity = 1, userId, name, paymentMethod, email, phone } = data;

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
			if (!occurrence) throw new AppException(AppErrorCode.OCCURRENCE_NOT_FOUND, { id: occurrenceId });

			const event = occurrence.event;
			if (!event) throw new AppException(AppErrorCode.EVENT_NOT_FOUND);
			if (
				event.status !== 'PUBLISHED' ||
				occurrence.status !== 'ACTIVE' ||
				new Date(occurrence.date) <= new Date()
			) {
				throw new AppException(AppErrorCode.EVENT_NOT_AVAILABLE_FOR_BOOKING);
			}

			let targetUserId = userId;
			let cancelledPaymentIntentId: string | null = null;

			if (email) {
				const existingUser = await tx.user.findUnique({ where: { email } });
				if (existingUser) {
					throw new AppException(AppErrorCode.EMAIL_ALREADY_EXISTS, { email });
				}
			}

			if (name) {
				const shadowUser = await tx.user.create({
					data: {
						email,
						name,
						phone,
						isShadow: true,
						emailVerified: false,
					},
				});
				targetUserId = shadowUser.id;
			}

			if (!targetUserId) {
				throw new AppException(AppErrorCode.BOOKING_USER_OR_NAME_REQUIRED);
			}

			const existing = await tx.booking.findUnique({
				where: { userId_occurrenceId: { userId: targetUserId, occurrenceId: occurrence.id } },
			});

			if (existing && existing.status === 'CONFIRMED') {
				throw new AppException(AppErrorCode.ALREADY_BOOKED);
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
				throw spotsLeft === 0
					? new AppException(AppErrorCode.NO_SPOTS_AVAILABLE)
					: new AppException(AppErrorCode.NOT_ENOUGH_SPOTS, { spotsLeft });
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

		await this.sendConfirmationSafely(result.booking.id);

		return {
			...result.booking,
			amount: Number(result.booking.amount),
			occurrence: mapOccurrenceForBookingResponse(result.occurrence),
			refundPercentage: 0,
			estimatedStripeFeeInCents: 0,
			estimatedRefundInCents: 0,
		} satisfies BookingWithEstimate;
	}

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
						occurrence: occurrence ? mapOccurrenceForBookingResponse(occurrence) : undefined,
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

				const refundPercentage = calculateRefundPercentage(
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
					occurrence: mapOccurrenceForBookingResponse(occurrence),
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

		if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (booking.userId !== userId) throw new AppException(AppErrorCode.NOT_YOUR_BOOKING);

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

			if (!currentBooking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
			if (currentBooking.userId !== userId) throw new AppException(AppErrorCode.NOT_YOUR_BOOKING);
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
		let refundFailed = false;

		try {
			const paymentIntent = await this.stripe.retrievePaymentIntent(booking.paymentIntentId);

			if (paymentIntent.status === 'succeeded') {
				const occurrenceDate = occurrence?.date ?? new Date();
				const refundPercentage = calculateRefundPercentage(
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
			refundFailed = true;
			this.logger.error(`Stripe refund failed for booking ${bookingId}:`, stripeError);
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
					reason: 'Booking cancelled. Stripe fee withheld.',
				},
				update: {
					stripeRefundId: refundResult.id,
					status: 'SUCCEEDED',
				},
			});
		} else if (refundFailed && booking.paymentIntentId) {
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
					status: 'FAILED',
					reason: 'Refund could not be processed at Stripe',
				},
				update: {
					status: 'FAILED',
					reason: 'Refund could not be processed at Stripe',
				},
			});
		}

		return booking;
	}

	async cancelEventBookings(eventId: string): Promise<void> {
		const { bookings } = await this.prisma.$transaction(async (tx) => {
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

			await tx.eventOccurrence.updateMany({
				where: { eventId },
				data: { currentParticipants: 0 },
			});

			return { bookings };
		});

		// Process refunds for each booking
		for (const booking of bookings) {
			if (!booking.paymentIntentId || Number(booking.amount) === 0) {
				continue;
			}

			let refundResult: { amount: number; id: string } | null = null;
			let refundFailed = false;

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
				refundFailed = true;
				this.logger.error(
					`Stripe refund failed for booking ${booking.id} (event cancellation):`,
					stripeError,
				);
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
						reason: 'Event cancelled. Full refund.',
					},
					update: {
						stripeRefundId: refundResult.id,
						status: 'SUCCEEDED',
					},
				});
			} else if (refundFailed && booking.paymentIntentId) {
				// Only a genuine Stripe failure is worth recording — see cancel().
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
						status: 'FAILED',
						reason: 'Refund could not be processed at Stripe (event cancelled)',
					},
					update: {
						status: 'FAILED',
						reason: 'Refund could not be processed at Stripe (event cancelled)',
					},
				});
			}
		}
	}

	async cancelOccurrenceBookings(occurrenceId: string): Promise<void> {
		const { bookings } = await this.prisma.$transaction(async (tx) => {
			const bookings = await tx.booking.findMany({
				where: {
					occurrenceId,
					status: { in: ['PENDING', 'CONFIRMED'] },
				},
				include: { user: true },
			});

			await tx.booking.updateMany({
				where: {
					occurrenceId,
					status: { in: ['PENDING', 'CONFIRMED'] },
				},
				data: { status: 'CANCELLED' },
			});

			await tx.eventOccurrence.update({
				where: { id: occurrenceId },
				data: { currentParticipants: 0 },
			});

			return { bookings };
		});

		for (const booking of bookings) {
			if (!booking.paymentIntentId || Number(booking.amount) === 0) {
				continue;
			}

			let refundResult: { amount: number; id: string } | null = null;
			let refundFailed = false;

			try {
				const paymentIntent = await this.stripe.retrievePaymentIntent(booking.paymentIntentId);

				if (paymentIntent.status === 'succeeded') {
					const baseAmountInCents = Math.round(Number(booking.amount) * 100);

					if (baseAmountInCents > 0) {
						const refund = await this.stripe.refund(
							booking.paymentIntentId,
							`occurrence-cancel-${occurrenceId}-${booking.id}`,
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
						`occurrence-cancel-${occurrenceId}-${booking.id}`,
					);
				}
			} catch (stripeError) {
				refundFailed = true;
				this.logger.error(
					`Stripe refund failed for booking ${booking.id} (occurrence cancellation):`,
					stripeError,
				);
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
						reason: 'Occurrence cancelled. Full refund.',
					},
					update: {
						stripeRefundId: refundResult.id,
						status: 'SUCCEEDED',
					},
				});
			} else if (refundFailed && booking.paymentIntentId) {
				// Only a genuine Stripe failure is worth recording — see cancel().
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
						status: 'FAILED',
						reason: 'Refund could not be processed at Stripe (occurrence cancelled)',
					},
					update: {
						status: 'FAILED',
						reason: 'Refund could not be processed at Stripe (occurrence cancelled)',
					},
				});
			}
		}
	}

	private async sendConfirmationSafely(bookingId: string): Promise<void> {
		try {
			const claimed = await this.prisma.booking.updateMany({
				where: { id: bookingId, confirmationSentAt: null },
				data: { confirmationSentAt: new Date() },
			});

			if (claimed.count === 0) {
				return;
			}

			const booking = await this.prisma.booking.findUnique({
				where: { id: bookingId },
				include: {
					user: true,
					occurrence: { include: { event: { include: { translations: true } } } },
				},
			});

			if (!booking?.user?.email) {
				return;
			}

			const translation =
				booking.occurrence.event.translations.find((t) => t.locale === 'en') ??
				booking.occurrence.event.translations[0];

			await this.mailService.sendBookingConfirmation({
				to: booking.user.email,
				locale: 'en',
				referenceNumber: booking.referenceNumber ?? 0,
				eventTitle: translation?.title ?? '',
				eventLocation: translation?.location,
				occurrenceDate: booking.occurrence.date,
				quantity: booking.quantity,
				amount: Number(booking.amount),
				currency: 'AMD',
				paymentMethod: booking.paymentMethod,
			});
		} catch (error) {
			this.logger.error(
				`Failed to send booking confirmation for booking ${bookingId}`,
				error as Error,
			);
		}
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
			throw new AppException(AppErrorCode.PAYMENT_SERVICE_UNAVAILABLE);
		}

		throw error;
	}
}
