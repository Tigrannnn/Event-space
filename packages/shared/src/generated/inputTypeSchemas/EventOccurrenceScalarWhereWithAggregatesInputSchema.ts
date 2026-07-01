import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';

export const EventOccurrenceScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.EventOccurrenceScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => EventOccurrenceScalarWhereWithAggregatesInputSchema), z.lazy(() => EventOccurrenceScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventOccurrenceScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventOccurrenceScalarWhereWithAggregatesInputSchema), z.lazy(() => EventOccurrenceScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  date: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  maxParticipants: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  currentParticipants: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
}).strict();

export default EventOccurrenceScalarWhereWithAggregatesInputSchema;
