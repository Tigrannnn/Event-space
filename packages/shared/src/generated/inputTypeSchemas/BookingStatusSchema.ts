import { z } from 'zod';

export const BookingStatusSchema = z.enum(['PENDING','CONFIRMED','CANCELLED']);

export type BookingStatusType = `${z.infer<typeof BookingStatusSchema>}`

export default BookingStatusSchema;
