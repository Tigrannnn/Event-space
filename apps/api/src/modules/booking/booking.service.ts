import { Injectable } from '@nestjs/common';
import { type Locale } from '@prisma/client';
import { DEFAULT_LOCALE } from '@infra/mail/mail-strings';
import {
	BookingWithEstimate,
	CreateBookingData,
	CreateManualBookingData,
} from '@event-space/shared';
import { BookingQueryService } from './use-cases/booking-query.service';
import { BookingPaymentService } from './use-cases/booking-payment.service';
import { BookingCancellationService } from './use-cases/booking-cancellation.service';
import { BookingCreationService } from './use-cases/booking-creation.service';

@Injectable()
export class BookingService {
	constructor(
		private readonly creation: BookingCreationService,
		private readonly queries: BookingQueryService,
		private readonly payments: BookingPaymentService,
		private readonly cancellations: BookingCancellationService,
	) {}

	create(
		userId: string,
		data: CreateBookingData,
		locale: Locale = DEFAULT_LOCALE,
		brandHost?: string,
	) {
		return this.creation.create(userId, data, locale, brandHost);
	}

	createManualBooking(
		adminId: string,
		data: CreateManualBookingData,
		locale: Locale = DEFAULT_LOCALE,
		brandHost?: string,
	) {
		return this.creation.createManualBooking(adminId, data, locale, brandHost);
	}

	reconcilePayment(
		paymentIntentId: string,
		bookingIdHint?: string,
		locale: Locale = DEFAULT_LOCALE,
	) {
		return this.payments.reconcilePayment(paymentIntentId, bookingIdHint, locale);
	}

	findByUser(userId: string): Promise<BookingWithEstimate[]> {
		return this.queries.findByUser(userId);
	}

	findOneForUser(userId: string, bookingId: string) {
		return this.queries.findOneForUser(userId, bookingId);
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
