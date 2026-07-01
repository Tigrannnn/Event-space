import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateNestedOneWithoutOccurrencesInputSchema } from './EventCreateNestedOneWithoutOccurrencesInputSchema';
import { BookingCreateNestedManyWithoutOccurrenceInputSchema } from './BookingCreateNestedManyWithoutOccurrenceInputSchema';

export const EventOccurrenceCreateInputSchema: z.ZodType<Prisma.EventOccurrenceCreateInput> = z.object({
  id: z.uuid().optional(),
  date: z.coerce.date(),
  maxParticipants: z.number().int().optional(),
  currentParticipants: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  event: z.lazy(() => EventCreateNestedOneWithoutOccurrencesInputSchema),
  bookings: z.lazy(() => BookingCreateNestedManyWithoutOccurrenceInputSchema).optional(),
}).strict();

export default EventOccurrenceCreateInputSchema;
