import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { EnumEventOccurrenceStatusFilterSchema } from './EnumEventOccurrenceStatusFilterSchema';
import { EventOccurrenceStatusSchema } from './EventOccurrenceStatusSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { EventScalarRelationFilterSchema } from './EventScalarRelationFilterSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { BookingListRelationFilterSchema } from './BookingListRelationFilterSchema';

export const EventOccurrenceWhereInputSchema: z.ZodType<Prisma.EventOccurrenceWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => EventOccurrenceWhereInputSchema), z.lazy(() => EventOccurrenceWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventOccurrenceWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventOccurrenceWhereInputSchema), z.lazy(() => EventOccurrenceWhereInputSchema).array() ]).optional(),
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
  event: z.union([ z.lazy(() => EventScalarRelationFilterSchema), z.lazy(() => EventWhereInputSchema) ]).optional(),
  bookings: z.lazy(() => BookingListRelationFilterSchema).optional(),
});

export default EventOccurrenceWhereInputSchema;
