import { Injectable } from '@nestjs/common';
import { type Locale } from '@prisma/client';
import { DEFAULT_LOCALE } from '@infra/mail/mail-strings';
import {
	BookingWithEstimate,
	type BookingDisplayStatus,
	type MyBookingsSummary,
	type PaginatedCursorResponse,
	ChangeQuantityData,
	ConfirmBookingManuallyData,
	CreateBookingData,
	CreateGuestBookingData,
	CreateManualBookingData,
	QuantityQuoteRequest,
} from '@event-space/shared';
import { BookingQueryService } from './use-cases/booking-query.service';
import { BookingPaymentService } from './use-cases/booking-payment.service';
import { BookingCancellationService } from './use-cases/booking-cancellation.service';
import { BookingCreationService } from './use-cases/booking-creation.service';
import { BookingQuantityService, type QuantityActor } from './use-cases/booking-quantity.service';
import { BookingTopUpService } from './use-cases/booking-top-up.service';

@Injectable()
export class BookingService {
	constructor(
		private readonly creation: BookingCreationService,
		private readonly queries: BookingQueryService,
		private readonly payments: BookingPaymentService,
		private readonly cancellations: BookingCancellationService,
		private readonly quantities: BookingQuantityService,
		private readonly topUps: BookingTopUpService,
	) {}

	create(
		userId: string,
		data: CreateBookingData,
		locale: Locale = DEFAULT_LOCALE,
		brandHost?: string,
	) {
		return this.creation.create(userId, data, locale, brandHost);
	}

	createGuest(
		data: CreateGuestBookingData,
		locale: Locale = DEFAULT_LOCALE,
		brandHost?: string,
	) {
		return this.creation.createGuest(data, locale, brandHost);
	}

	createManualBooking(
		adminId: string,
		data: CreateManualBookingData,
		locale: Locale = DEFAULT_LOCALE,
		brandHost?: string,
	) {
		return this.creation.createManualBooking(adminId, data, locale, brandHost);
	}

	confirmManually(
		bookingId: string,
		data: ConfirmBookingManuallyData,
		locale: Locale = DEFAULT_LOCALE,
	) {
		return this.creation.confirmManually(bookingId, data, locale);
	}

	quoteQuantity(actor: QuantityActor, bookingId: string, request: QuantityQuoteRequest) {
		return this.quantities.quote(actor, bookingId, request);
	}

	changeQuantity(actor: QuantityActor, bookingId: string, data: ChangeQuantityData) {
		return this.quantities.change(actor, bookingId, data);
	}

	startQuantityPayment(userId: string, bookingId: string, request: QuantityQuoteRequest) {
		return this.topUps.start(userId, bookingId, request);
	}

	reconcileQuantityPayment(userId: string, bookingId: string, paymentIntentId: string) {
		return this.topUps.reconcile(userId, bookingId, paymentIntentId);
	}

	reconcilePayment(
		paymentIntentId: string,
		bookingIdHint?: string,
		locale: Locale = DEFAULT_LOCALE,
	) {
		return this.payments.reconcilePayment(paymentIntentId, bookingIdHint, locale);
	}

	findByUser(
		userId: string,
		params?: { cursor?: string; limit?: number; status?: BookingDisplayStatus },
	): Promise<PaginatedCursorResponse<BookingWithEstimate>> {
		return this.queries.findByUser(userId, params);
	}

	summaryForUser(userId: string): Promise<MyBookingsSummary> {
		return this.queries.summaryForUser(userId);
	}

	resolveActor(bookingId: string, userId?: string, token?: string) {
		return this.queries.resolveActor(bookingId, userId, token);
	}

	checkinQrPng(token: string, host?: string) {
		return this.queries.checkinQrPng(token, host);
	}

	findOneDetailed(userId: string, bookingId: string) {
		return this.queries.findOneDetailed(userId, bookingId);
	}

	findOneForUser(userId: string, bookingId: string) {
		return this.queries.findOneForUser(userId, bookingId);
	}

	acceptReschedule(userId: string, bookingId: string) {
		return this.queries.acceptReschedule(userId, bookingId);
	}

	cancel(userId: string, bookingId: string, locale?: Locale) {
		return this.cancellations.cancel(userId, bookingId, locale);
	}

	cancelEventBookings(eventId: string): Promise<void> {
		return this.cancellations.cancelEventBookings(eventId);
	}

	cancelOccurrenceBookings(occurrenceId: string): Promise<void> {
		return this.cancellations.cancelOccurrenceBookings(occurrenceId);
	}
}
