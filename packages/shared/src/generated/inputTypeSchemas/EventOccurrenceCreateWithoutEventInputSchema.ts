import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceStatusSchema } from './EventOccurrenceStatusSchema';
import { BookingCreateNestedManyWithoutOccurrenceInputSchema } from './BookingCreateNestedManyWithoutOccurrenceInputSchema';

export const EventOccurrenceCreateWithoutEventInputSchema: z.ZodType<Prisma.EventOccurrenceCreateWithoutEventInput> = z.strictObject({
  id: z.uuid().optional(),
  date: z.coerce.date(),
  status: z.lazy(() => EventOccurrenceStatusSchema).optional(),
  maxParticipants: z.number().int().optional(),
  currentParticipants: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  bookings: z.lazy(() => BookingCreateNestedManyWithoutOccurrenceInputSchema).optional(),
});

export default EventOccurrenceCreateWithoutEventInputSchema;
