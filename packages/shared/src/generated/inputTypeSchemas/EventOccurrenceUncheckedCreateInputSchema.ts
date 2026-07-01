import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingUncheckedCreateNestedManyWithoutOccurrenceInputSchema } from './BookingUncheckedCreateNestedManyWithoutOccurrenceInputSchema';

export const EventOccurrenceUncheckedCreateInputSchema: z.ZodType<Prisma.EventOccurrenceUncheckedCreateInput> = z.object({
  id: z.uuid().optional(),
  eventId: z.string(),
  date: z.coerce.date(),
  maxParticipants: z.number().int().optional(),
  currentParticipants: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  bookings: z.lazy(() => BookingUncheckedCreateNestedManyWithoutOccurrenceInputSchema).optional(),
}).strict();

export default EventOccurrenceUncheckedCreateInputSchema;
