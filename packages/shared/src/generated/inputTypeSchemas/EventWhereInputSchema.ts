import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumEventDifficultyNullableFilterSchema } from './EnumEventDifficultyNullableFilterSchema';
import { EventDifficultySchema } from './EventDifficultySchema';
import { DecimalFilterSchema } from './DecimalFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { EnumEventStatusFilterSchema } from './EnumEventStatusFilterSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { CategoryScalarRelationFilterSchema } from './CategoryScalarRelationFilterSchema';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';
import { EventOccurrenceListRelationFilterSchema } from './EventOccurrenceListRelationFilterSchema';
import { EventImageListRelationFilterSchema } from './EventImageListRelationFilterSchema';
import { FavoriteListRelationFilterSchema } from './FavoriteListRelationFilterSchema';
import { CancellationPolicyRuleListRelationFilterSchema } from './CancellationPolicyRuleListRelationFilterSchema';
import { EventTranslationListRelationFilterSchema } from './EventTranslationListRelationFilterSchema';

export const EventWhereInputSchema: z.ZodType<Prisma.EventWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => EventWhereInputSchema), z.lazy(() => EventWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventWhereInputSchema), z.lazy(() => EventWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  locationUrl: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  meetingLocationUrl: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  difficulty: z.union([ z.lazy(() => EnumEventDifficultyNullableFilterSchema), z.lazy(() => EventDifficultySchema) ]).optional().nullable(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  duration: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumEventStatusFilterSchema), z.lazy(() => EventStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  categoryId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  organizer: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  category: z.union([ z.lazy(() => CategoryScalarRelationFilterSchema), z.lazy(() => CategoryWhereInputSchema) ]).optional(),
  occurrences: z.lazy(() => EventOccurrenceListRelationFilterSchema).optional(),
  images: z.lazy(() => EventImageListRelationFilterSchema).optional(),
  favorites: z.lazy(() => FavoriteListRelationFilterSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleListRelationFilterSchema).optional(),
  translations: z.lazy(() => EventTranslationListRelationFilterSchema).optional(),
});

export default EventWhereInputSchema;
