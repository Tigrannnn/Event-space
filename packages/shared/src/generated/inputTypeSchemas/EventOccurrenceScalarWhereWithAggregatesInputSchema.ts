import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { EnumEventOccurrenceStatusWithAggregatesFilterSchema } from './EnumEventOccurrenceStatusWithAggregatesFilterSchema';
import { EventOccurrenceStatusSchema } from './EventOccurrenceStatusSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';

export const EventOccurrenceScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.EventOccurrenceScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => EventOccurrenceScalarWhereWithAggregatesInputSchema), z.lazy(() => EventOccurrenceScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventOccurrenceScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventOccurrenceScalarWhereWithAggregatesInputSchema), z.lazy(() => EventOccurrenceScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  date: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => EnumEventOccurrenceStatusWithAggregatesFilterSchema), z.lazy(() => EventOccurrenceStatusSchema) ]).optional(),
  maxParticipants: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  currentParticipants: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
  cancelReason: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
});

export default EventOccurrenceScalarWhereWithAggregatesInputSchema;
