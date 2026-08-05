import { z } from 'zod';

export const BookingStatusHistoryScalarFieldEnumSchema = z.enum(['id','bookingId','status','validFrom','validTo']);

export default BookingStatusHistoryScalarFieldEnumSchema;
