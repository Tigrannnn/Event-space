import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceStatusSchema } from './EventOccurrenceStatusSchema';
import { BookingUncheckedCreateNestedManyWithoutOccurrenceInputSchema } from './BookingUncheckedCreateNestedManyWithoutOccurrenceInputSchema';

export const EventOccurrenceUncheckedCreateWithoutEventInputSchema: z.ZodType<Prisma.EventOccurrenceUncheckedCreateWithoutEventInput> = z.strictObject({
  id: z.uuid().optional(),
  date: z.coerce.date(),
  status: z.lazy(() => EventOccurrenceStatusSchema).optional(),
  maxParticipants: z.number().int().optional(),
  currentParticipants: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  cancelReason: z.string().optional().nullable(),
  bookings: z.lazy(() => BookingUncheckedCreateNestedManyWithoutOccurrenceInputSchema).optional(),
});

export default EventOccurrenceUncheckedCreateWithoutEventInputSchema;
