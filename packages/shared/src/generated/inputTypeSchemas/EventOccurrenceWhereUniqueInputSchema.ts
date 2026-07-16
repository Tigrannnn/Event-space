import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceWhereInputSchema } from './EventOccurrenceWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { EventScalarRelationFilterSchema } from './EventScalarRelationFilterSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { BookingListRelationFilterSchema } from './BookingListRelationFilterSchema';

export const EventOccurrenceWhereUniqueInputSchema: z.ZodType<Prisma.EventOccurrenceWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => EventOccurrenceWhereInputSchema), z.lazy(() => EventOccurrenceWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventOccurrenceWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventOccurrenceWhereInputSchema), z.lazy(() => EventOccurrenceWhereInputSchema).array() ]).optional(),
  eventId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  date: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  maxParticipants: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  currentParticipants: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  event: z.union([ z.lazy(() => EventScalarRelationFilterSchema), z.lazy(() => EventWhereInputSchema) ]).optional(),
  bookings: z.lazy(() => BookingListRelationFilterSchema).optional(),
}));

export default EventOccurrenceWhereUniqueInputSchema;
