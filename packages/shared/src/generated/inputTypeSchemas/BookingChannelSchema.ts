import { z } from 'zod';

export const BookingChannelSchema = z.enum(['DIRECT','GETYOURGUIDE','VIATOR','OTHER']);

export type BookingChannelType = `${z.infer<typeof BookingChannelSchema>}`

export default BookingChannelSchema;
