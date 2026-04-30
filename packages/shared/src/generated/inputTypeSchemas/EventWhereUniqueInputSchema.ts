import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { EnumEventDifficultyFilterSchema } from './EnumEventDifficultyFilterSchema';
import { EventDifficultySchema } from './EventDifficultySchema';
import { DecimalFilterSchema } from './DecimalFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { EnumEventStatusFilterSchema } from './EnumEventStatusFilterSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { BookingListRelationFilterSchema } from './BookingListRelationFilterSchema';

export const EventWhereUniqueInputSchema: z.ZodType<Prisma.EventWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.object({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => EventWhereInputSchema), z.lazy(() => EventWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventWhereInputSchema), z.lazy(() => EventWhereInputSchema).array() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  images: z.lazy(() => StringNullableListFilterSchema).optional(),
  location: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  date: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  difficulty: z.union([ z.lazy(() => EnumEventDifficultyFilterSchema), z.lazy(() => EventDifficultySchema) ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  maxParticipants: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  currentParticipants: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  category: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  whatsIncluded: z.lazy(() => StringNullableListFilterSchema).optional(),
  duration: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  status: z.union([ z.lazy(() => EnumEventStatusFilterSchema), z.lazy(() => EventStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  organizer: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  bookings: z.lazy(() => BookingListRelationFilterSchema).optional(),
}).strict());

export default EventWhereUniqueInputSchema;
