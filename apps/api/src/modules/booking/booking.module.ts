import { forwardRef, Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PromoCodeService } from './promo/promo-code.service';
import { PromoCodeController } from './promo/promo-code.controller';
import { BookingReconcileService } from './jobs/booking-reconcile.service';
import { BookingReminderService } from './jobs/booking-reminder.service';
import { BookingRefundRetryService } from './jobs/booking-refund-retry.service';
import { BookingConfirmationRetryService } from './jobs/booking-confirmation-retry.service';
import { BookingLedgerService } from './money/booking-ledger.service';
import { BookingRefundService } from './money/booking-refund.service';
import { BookingQueryService } from './use-cases/booking-query.service';
import { BookingNotificationService } from './use-cases/booking-notification.service';
import { BookingPaymentService } from './use-cases/booking-payment.service';
import { BookingCancellationService } from './use-cases/booking-cancellation.service';
import { BookingCreationService } from './use-cases/booking-creation.service';
import { BookingQuantityService } from './use-cases/booking-quantity.service';
import { BookingTopUpService } from './use-cases/booking-top-up.service';
import { BookingTopUpJobService } from './jobs/booking-top-up.service';
import { StripeModule } from '@infra/stripe/stripe.module';

@Module({
	imports: [forwardRef(() => StripeModule)],
	providers: [
		BookingService,
		BookingReconcileService,
		BookingReminderService,
		BookingRefundRetryService,
		BookingConfirmationRetryService,
		BookingLedgerService,
		BookingRefundService,
		BookingQueryService,
		BookingNotificationService,
		BookingPaymentService,
		BookingCancellationService,
		BookingCreationService,
		BookingQuantityService,
		BookingTopUpService,
		BookingTopUpJobService,
		PromoCodeService,
	],
	exports: [BookingService, BookingLedgerService, BookingRefundService],
	controllers: [BookingController, PromoCodeController],
})
export class BookingModule {}
