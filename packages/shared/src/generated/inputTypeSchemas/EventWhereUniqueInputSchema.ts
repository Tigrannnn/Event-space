import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { EnumEventDifficultyNullableFilterSchema } from './EnumEventDifficultyNullableFilterSchema';
import { EventDifficultySchema } from './EventDifficultySchema';
import { DecimalFilterSchema } from './DecimalFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { EnumEventStatusFilterSchema } from './EnumEventStatusFilterSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { BookingListRelationFilterSchema } from './BookingListRelationFilterSchema';
import { EventImageListRelationFilterSchema } from './EventImageListRelationFilterSchema';
import { CancellationPolicyRuleListRelationFilterSchema } from './CancellationPolicyRuleListRelationFilterSchema';
import { EventTranslationListRelationFilterSchema } from './EventTranslationListRelationFilterSchema';

export const EventWhereUniqueInputSchema: z.ZodType<Prisma.EventWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.object({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => EventWhereInputSchema), z.lazy(() => EventWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventWhereInputSchema), z.lazy(() => EventWhereInputSchema).array() ]).optional(),
  locationUrl: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  date: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  difficulty: z.union([ z.lazy(() => EnumEventDifficultyNullableFilterSchema), z.lazy(() => EventDifficultySchema) ]).optional().nullable(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  maxParticipants: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  currentParticipants: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  duration: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  status: z.union([ z.lazy(() => EnumEventStatusFilterSchema), z.lazy(() => EventStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  organizer: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  bookings: z.lazy(() => BookingListRelationFilterSchema).optional(),
  images: z.lazy(() => EventImageListRelationFilterSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleListRelationFilterSchema).optional(),
  translations: z.lazy(() => EventTranslationListRelationFilterSchema).optional(),
}).strict());

export default EventWhereUniqueInputSchema;
