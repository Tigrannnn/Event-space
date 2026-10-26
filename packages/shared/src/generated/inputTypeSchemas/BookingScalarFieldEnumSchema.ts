import { z } from 'zod';

export const BookingScalarFieldEnumSchema = z.enum(['id','userId','occurrenceId','status','quantity','createdAt','updatedAt','amount','baseAmount','discountPercent','promoCodeId','paymentMethod','createdByAdminId','rescheduleRefundUntil','rescheduleAcceptedAt','brandHost','paymentIntentId','referenceNumber','checkedInAt','confirmationSentAt','reminderSentAt','reviewInviteSentAt']);

export default BookingScalarFieldEnumSchema;
