import { BookingService } from '../booking.service';
import { BookingLedgerService } from '../money/booking-ledger.service';
import { BookingRefundService } from '../money/booking-refund.service';
import { BookingQueryService } from '../use-cases/booking-query.service';
import { BookingNotificationService } from '../use-cases/booking-notification.service';
import { BookingPaymentService } from '../use-cases/booking-payment.service';
import { BookingCancellationService } from '../use-cases/booking-cancellation.service';
import { BookingCreationService } from '../use-cases/booking-creation.service';
import { BookingQuantityService } from '../use-cases/booking-quantity.service';

export function createBookingKit(prisma: never, stripe: never, mail: never) {
	const ledger = new BookingLedgerService(prisma);
	const refunds = new BookingRefundService(stripe, ledger);
	const queries = new BookingQueryService(prisma, stripe);
	const notifications = new BookingNotificationService(prisma, mail);
	const payments = new BookingPaymentService(prisma, stripe, ledger, notifications);
	const cancellations = new BookingCancellationService(prisma, ledger, refunds, notifications);
	const creation = new BookingCreationService(prisma, stripe, notifications, payments, ledger);
	const quantities = new BookingQuantityService(prisma, stripe, ledger, refunds);

	return {
		service: new BookingService(creation, queries, payments, cancellations, quantities),
		ledger,
		refunds,
	};
}

export function createBookingService(prisma: never, stripe: never, mail: never): BookingService {
	return createBookingKit(prisma, stripe, mail).service;
}
