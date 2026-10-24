import { BookingService } from '../booking.service';
import { BookingLedgerService } from '../money/booking-ledger.service';
import { BookingRefundService } from '../money/booking-refund.service';
import { BookingQueryService } from '../use-cases/booking-query.service';
import { BookingNotificationService } from '../use-cases/booking-notification.service';
import { BookingPaymentService } from '../use-cases/booking-payment.service';
import { BookingCancellationService } from '../use-cases/booking-cancellation.service';
import { BookingCreationService } from '../use-cases/booking-creation.service';
import { BookingQuantityService } from '../use-cases/booking-quantity.service';
import { BookingTopUpService } from '../use-cases/booking-top-up.service';

export function createBookingKit(prisma: never, stripe: never, mail: never) {
	const ledger = new BookingLedgerService(prisma);
	const refunds = new BookingRefundService(stripe, ledger);
	const queries = new BookingQueryService(prisma);
	const notifications = new BookingNotificationService(prisma, mail);
	const cancellations = new BookingCancellationService(prisma, refunds, notifications);
	const quantities = new BookingQuantityService(prisma, refunds, notifications);
	const topUps = new BookingTopUpService(prisma, stripe, ledger, refunds, quantities, notifications);
	const payments = new BookingPaymentService(prisma, stripe, ledger, notifications, topUps);
	const creation = new BookingCreationService(prisma, stripe, notifications, payments, ledger);

	return {
		service: new BookingService(creation, queries, payments, cancellations, quantities, topUps),
		ledger,
		refunds,
		topUps,
	};
}

export function createBookingService(prisma: never, stripe: never, mail: never): BookingService {
	return createBookingKit(prisma, stripe, mail).service;
}
