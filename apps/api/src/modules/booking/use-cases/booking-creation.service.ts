import { Injectable, Logger } from '@nestjs/common';
import { type Locale } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { DEFAULT_LOCALE } from '@infra/mail/mail-strings';
import {
	AppErrorCode,
	BookingWithEstimate,
	estimateStripeFeeInCents,
	CreateBookingData,
	ConfirmBookingManuallyData,
	CreateManualBookingData,
} from '@event-space/shared';
import { AppException } from '@shared';
import { StripeService } from '@infra/stripe/stripe.service';
import {
	CANCELABLE_PAYMENT_INTENT_STATUSES,
	type CancelablePaymentIntentStatus,
	StripePaymentIntent,
} from '@infra/stripe/stripe.types';
import {
	calculateRefundPercentage,
	getNextBookingReference,
	mapOccurrenceForBookingResponse,
	nullableNumber,
	priceBooking,
} from '../booking.utils';
import { BookingLedgerService } from '../money/booking-ledger.service';
import { BookingNotificationService } from './booking-notification.service';
import { BookingPaymentService } from './booking-payment.service';
import { PromoCodeService } from '../promo/promo-code.service';

@Injectable()
export class BookingCreationService {
	private readonly logger = new Logger(BookingCreationService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
		private readonly notifications: BookingNotificationService,
		private readonly payments: BookingPaymentService,
		private readonly ledger: BookingLedgerService,
		private readonly promoCodes: PromoCodeService,
	) {}

	async create(
		userId: string,
		data: CreateBookingData,
		locale: Locale = DEFAULT_LOCALE,
		brandHost?: string,
	) {
		const { occurrenceId, quantity = 1, phone } = data;

		const { booking, event, occurrence, freedIntentId } = await this.prisma.$transaction(
			async (tx) => {
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

				if (!occurrence)
					throw new AppException(AppErrorCode.OCCURRENCE_NOT_FOUND, { id: occurrenceId });

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

				if (phone) {
					await tx.user.update({
						where: { id: userId },
						data: { phone: { set: phone } },
					});
				}

				let pricing = priceBooking(event.price, occurrence.discountPercent, quantity);
				let promoCodeId: string | null = null;

				if (data.promoCode) {
					const promoCode = await this.promoCodes.findApplicable(data.promoCode, event, tx);
					await this.promoCodes.assertWithinUserLimit(promoCode, userId, tx);

					// A retry of the same still-pending booking (e.g. payment failed and the
					// customer tried again) must not spend a second use of the code.
					const alreadyRedeemedByThisBooking =
						existing?.status === 'PENDING' && existing.promoCodeId === promoCode.id;

					if (!alreadyRedeemedByThisBooking) {
						await this.promoCodes.redeem(tx, promoCode);
					}

					pricing = this.promoCodes.quote(
						promoCode,
						event.price,
						quantity,
						occurrence.discountPercent,
					);
					promoCodeId = promoCode.id;
				}

				// Re-booking reuses the same row (unique [userId, occurrenceId]). A payment intent
				// left over from a finished cycle may already be paid — and even refunded — so
				// carrying it into a new attempt would confirm this booking without payment.
				// Only a still-PENDING booking is in the same cycle and may keep its intent.
				const keepsPaymentIntent = existing?.status === 'PENDING';

				const upserted = await tx.booking.upsert({
					where: { userId_occurrenceId: { userId, occurrenceId: occurrence.id } },
					update: {
						status: 'PENDING',
						quantity,
						...pricing,
						promoCodeId,
						...(keepsPaymentIntent ? {} : { paymentIntentId: null }),
						...(brandHost ? { brandHost } : {}),
					},
					create: {
						userId,
						occurrenceId: occurrence.id,
						status: 'PENDING',
						quantity,
						...pricing,
						promoCodeId,
						brandHost,
					},
				});

				await tx.user.update({ where: { id: userId }, data: { locale } });

				if (pricing.amount > 0) {
					return { booking: upserted, event, occurrence, freedIntentId: null };
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

				const confirmed = await tx.booking.update({
					where: { id: upserted.id },
					data: {
						status: 'CONFIRMED',
						paymentIntentId: null,
						referenceNumber: upserted.referenceNumber ?? (await getNextBookingReference(tx)),
					},
				});

				return {
					booking: confirmed,
					event,
					occurrence,
					freedIntentId: existing?.paymentIntentId ?? null,
				};
			},
		);

		if (Number(booking.amount) === 0) {
			if (freedIntentId) {
				try {
					await this.stripe.cancelPaymentIntent(freedIntentId, `free-booking-${booking.id}`);
				} catch (e) {
					this.logger.warn(
						`Failed to cancel payment intent ${freedIntentId} freed by a full discount on booking ${booking.id}`,
						e as Error,
					);
				}
			}

			await this.notifications.sendConfirmation(booking.id, locale);

			return {
				booking: {
					...booking,
					amount: Number(booking.amount),
					baseAmount: nullableNumber(booking.baseAmount),
					occurrence: mapOccurrenceForBookingResponse(occurrence),
					refundPercentage: 0,
					refundReason: 'RULES' as const,
					estimatedStripeFeeInCents: 0,
					estimatedRefundInCents: 0,
				} satisfies BookingWithEstimate,
				clientSecret: null,
			};
		}

		let paymentIntent: StripePaymentIntent | null = null;
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
				} else if (existingIntent.status === 'succeeded') {
					const reconciled = await this.payments.reconcilePayment(existingIntent.id, booking.id, locale);
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
				baseAmount: nullableNumber(updatedBooking.baseAmount),
				occurrence: mapOccurrenceForBookingResponse(occurrence),
				refundPercentage,
				refundReason: 'RULES' as const,
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

	async createManualBooking(
		adminId: string,
		data: CreateManualBookingData,
		locale: Locale = DEFAULT_LOCALE,
		brandHost?: string,
	) {
		const {
			occurrenceId,
			quantity = 1,
			userId,
			name,
			paymentMethod,
			email,
			phone,
			locale: mailLocale,
		} = data;

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
				const existingUser = await tx.user.findUnique({
					where: { email },
					select: { id: true, emailVerified: true },
				});

				if (existingUser?.emailVerified) {
					throw new AppException(AppErrorCode.EMAIL_ALREADY_EXISTS, { email });
				}

				if (existingUser) {
					targetUserId = existingUser.id;

					await tx.user.update({
						where: { id: existingUser.id },
						data: {
							...(name ? { name } : {}),
							...(phone ? { phone } : {}),
							...(mailLocale ? { locale: mailLocale } : {}),
						},
					});
				}
			}

			if (name && !targetUserId) {
				const shadowUser = await tx.user.create({
					data: {
						email,
						name,
						phone,
						isShadow: true,
						emailVerified: false,
						locale: mailLocale ?? null,
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

			const pricing = priceBooking(event.price, occurrence.discountPercent, quantity);

			const referenceNumber = existing?.referenceNumber ?? (await getNextBookingReference(tx));

			const bookingData = {
				status: 'CONFIRMED' as const,
				quantity,
				...pricing,
				paymentIntentId: null,
				paymentMethod,
				createdByAdminId: adminId,
				referenceNumber,
				brandHost,
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

			if (paymentMethod === 'OFFLINE_PAID') {
				await this.ledger.recordOfflinePayment(tx, booking.id, pricing.amount);
			}

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

		await this.notifications.sendConfirmation(result.booking.id, mailLocale ?? locale);

		return {
			...result.booking,
			amount: Number(result.booking.amount),
			baseAmount: nullableNumber(result.booking.baseAmount),
			occurrence: mapOccurrenceForBookingResponse(result.occurrence),
			refundPercentage: 0,
			refundReason: 'RULES' as const,
			estimatedStripeFeeInCents: 0,
			estimatedRefundInCents: 0,
		} satisfies BookingWithEstimate;
	}

	async confirmManually(
		bookingId: string,
		data: ConfirmBookingManuallyData,
		locale: Locale = DEFAULT_LOCALE,
	) {
		const { paymentMethod } = data;

		const pending = await this.prisma.booking.findUnique({ where: { id: bookingId } });
		if (!pending) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		if (pending.status !== 'PENDING') throw new AppException(AppErrorCode.BOOKING_NOT_PENDING);

		if (pending.paymentIntentId) {
			await this.releaseCardPayment(pending.id, pending.paymentIntentId);
		}

		const confirmed = await this.prisma.$transaction(async (tx) => {
			const booking = await tx.booking.findUnique({
				where: { id: bookingId },
				include: { occurrence: { include: { event: { select: { price: true } } } } },
			});
			if (!booking) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
			if (booking.status !== 'PENDING') throw new AppException(AppErrorCode.BOOKING_NOT_PENDING);

			const occurrence = booking.occurrence;
			if (!occurrence) throw new AppException(AppErrorCode.OCCURRENCE_NOT_FOUND);
			if (occurrence.status !== 'ACTIVE' || new Date(occurrence.date) <= new Date()) {
				throw new AppException(AppErrorCode.EVENT_NOT_AVAILABLE_FOR_BOOKING);
			}

			const quantity = data.quantity ?? booking.quantity;
			const pricing = priceBooking(occurrence.event.price, occurrence.discountPercent, quantity);

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

			const referenceNumber = booking.referenceNumber ?? (await getNextBookingReference(tx));

			const updated = await tx.booking.update({
				where: { id: bookingId },
				data: {
					status: 'CONFIRMED',
					paymentMethod,
					paymentIntentId: null,
					referenceNumber,
					quantity,
					...pricing,
				},
			});

			if (paymentMethod === 'OFFLINE_PAID') {
				await this.ledger.recordOfflinePayment(tx, bookingId, pricing.amount);
			}

			return updated;
		});

		await this.notifications.sendConfirmation(confirmed.id, locale);

		return {
			...confirmed,
			amount: Number(confirmed.amount),
			baseAmount: nullableNumber(confirmed.baseAmount),
		};
	}

	private async releaseCardPayment(bookingId: string, paymentIntentId: string): Promise<void> {
		try {
			const paymentIntent = await this.stripe.retrievePaymentIntent(paymentIntentId);

			if (paymentIntent.status === 'succeeded') {
				try {
					await this.payments.reconcilePayment(paymentIntentId, bookingId);
				} catch (reconcileError) {
					this.logger.warn(
						`Could not reconcile payment intent ${paymentIntentId} for booking ${bookingId}`,
						reconcileError as Error,
					);
				}
				throw new AppException(AppErrorCode.PAYMENT_ALREADY_RECEIVED);
			}

			if (
				CANCELABLE_PAYMENT_INTENT_STATUSES.includes(
					paymentIntent.status as CancelablePaymentIntentStatus,
				)
			) {
				await this.stripe.cancelPaymentIntent(paymentIntentId, `manual-confirm-${bookingId}`);
				return;
			}

			if (paymentIntent.status !== 'canceled') {
				throw new AppException(AppErrorCode.PAYMENT_ALREADY_RECEIVED);
			}
		} catch (error) {
			if (error instanceof AppException) throw error;
			this.rethrowStripeError(error);
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
