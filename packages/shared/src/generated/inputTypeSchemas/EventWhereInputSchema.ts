import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { EnumEventDifficultyFilterSchema } from './EnumEventDifficultyFilterSchema';
import { EventDifficultySchema } from './EventDifficultySchema';
import { DecimalFilterSchema } from './DecimalFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { EnumEventStatusFilterSchema } from './EnumEventStatusFilterSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { BookingListRelationFilterSchema } from './BookingListRelationFilterSchema';
import { EventImageListRelationFilterSchema } from './EventImageListRelationFilterSchema';

export const EventWhereInputSchema: z.ZodType<Prisma.EventWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EventWhereInputSchema), z.lazy(() => EventWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventWhereInputSchema), z.lazy(() => EventWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  location: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  date: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  difficulty: z.union([ z.lazy(() => EnumEventDifficultyFilterSchema), z.lazy(() => EventDifficultySchema) ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  maxParticipants: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  currentParticipants: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  category: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  whatsIncluded: z.lazy(() => StringNullableListFilterSchema).optional(),
  duration: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumEventStatusFilterSchema), z.lazy(() => EventStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  organizer: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  bookings: z.lazy(() => BookingListRelationFilterSchema).optional(),
  images: z.lazy(() => EventImageListRelationFilterSchema).optional(),
}).strict();

export default EventWhereInputSchema;
