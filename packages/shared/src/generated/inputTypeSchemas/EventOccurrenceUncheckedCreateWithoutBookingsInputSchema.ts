import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceStatusSchema } from './EventOccurrenceStatusSchema';

export const EventOccurrenceUncheckedCreateWithoutBookingsInputSchema: z.ZodType<Prisma.EventOccurrenceUncheckedCreateWithoutBookingsInput> = z.strictObject({
  id: z.uuid().optional(),
  eventId: z.string(),
  date: z.coerce.date(),
  status: z.lazy(() => EventOccurrenceStatusSchema).optional(),
  maxParticipants: z.number().int().optional(),
  currentParticipants: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  cancelReason: z.string().optional().nullable(),
});

export default EventOccurrenceUncheckedCreateWithoutBookingsInputSchema;
