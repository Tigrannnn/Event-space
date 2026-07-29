import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { UserCreateNestedOneWithoutEventsInputSchema } from './UserCreateNestedOneWithoutEventsInputSchema';
import { EventOccurrenceCreateNestedManyWithoutEventInputSchema } from './EventOccurrenceCreateNestedManyWithoutEventInputSchema';
import { EventImageCreateNestedManyWithoutEventInputSchema } from './EventImageCreateNestedManyWithoutEventInputSchema';
import { FavoriteCreateNestedManyWithoutEventInputSchema } from './FavoriteCreateNestedManyWithoutEventInputSchema';
import { CancellationPolicyRuleCreateNestedManyWithoutEventInputSchema } from './CancellationPolicyRuleCreateNestedManyWithoutEventInputSchema';
import { EventTranslationCreateNestedManyWithoutEventInputSchema } from './EventTranslationCreateNestedManyWithoutEventInputSchema';

export const EventCreateWithoutCategoryInputSchema: z.ZodType<Prisma.EventCreateWithoutCategoryInput> = z.strictObject({
  id: z.uuid().optional(),
  locationUrl: z.string(),
  meetingLocationUrl: z.string(),
  difficulty: z.lazy(() => EventDifficultySchema).optional().nullable(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  duration: z.number().int(),
  status: z.lazy(() => EventStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  organizer: z.lazy(() => UserCreateNestedOneWithoutEventsInputSchema),
  occurrences: z.lazy(() => EventOccurrenceCreateNestedManyWithoutEventInputSchema).optional(),
  images: z.lazy(() => EventImageCreateNestedManyWithoutEventInputSchema).optional(),
  favorites: z.lazy(() => FavoriteCreateNestedManyWithoutEventInputSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleCreateNestedManyWithoutEventInputSchema).optional(),
  translations: z.lazy(() => EventTranslationCreateNestedManyWithoutEventInputSchema).optional(),
});

export default EventCreateWithoutCategoryInputSchema;
