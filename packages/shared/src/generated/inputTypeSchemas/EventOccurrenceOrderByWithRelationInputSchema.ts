import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { EventOrderByWithRelationInputSchema } from './EventOrderByWithRelationInputSchema';
import { BookingOrderByRelationAggregateInputSchema } from './BookingOrderByRelationAggregateInputSchema';

export const EventOccurrenceOrderByWithRelationInputSchema: z.ZodType<Prisma.EventOccurrenceOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  eventId: z.lazy(() => SortOrderSchema).optional(),
  date: z.lazy(() => SortOrderSchema).optional(),
  maxParticipants: z.lazy(() => SortOrderSchema).optional(),
  currentParticipants: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  event: z.lazy(() => EventOrderByWithRelationInputSchema).optional(),
  bookings: z.lazy(() => BookingOrderByRelationAggregateInputSchema).optional(),
}).strict();

export default EventOccurrenceOrderByWithRelationInputSchema;
