import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { EnumEventOccurrenceStatusFilterSchema } from './EnumEventOccurrenceStatusFilterSchema';
import { EventOccurrenceStatusSchema } from './EventOccurrenceStatusSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';

export const EventOccurrenceScalarWhereInputSchema: z.ZodType<Prisma.EventOccurrenceScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => EventOccurrenceScalarWhereInputSchema), z.lazy(() => EventOccurrenceScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventOccurrenceScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventOccurrenceScalarWhereInputSchema), z.lazy(() => EventOccurrenceScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  date: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => EnumEventOccurrenceStatusFilterSchema), z.lazy(() => EventOccurrenceStatusSchema) ]).optional(),
  maxParticipants: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  currentParticipants: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  cancelReason: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
});

export default EventOccurrenceScalarWhereInputSchema;
