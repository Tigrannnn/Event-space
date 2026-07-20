import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceStatusSchema } from './EventOccurrenceStatusSchema';

export const EventOccurrenceCreateManyEventInputSchema: z.ZodType<Prisma.EventOccurrenceCreateManyEventInput> = z.strictObject({
  id: z.uuid().optional(),
  date: z.coerce.date(),
  status: z.lazy(() => EventOccurrenceStatusSchema).optional(),
  maxParticipants: z.number().int().optional(),
  currentParticipants: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export default EventOccurrenceCreateManyEventInputSchema;
