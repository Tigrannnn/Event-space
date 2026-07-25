import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { UserCreateNestedOneWithoutEventsInputSchema } from './UserCreateNestedOneWithoutEventsInputSchema';
import { CategoryCreateNestedOneWithoutEventsInputSchema } from './CategoryCreateNestedOneWithoutEventsInputSchema';
import { EventImageCreateNestedManyWithoutEventInputSchema } from './EventImageCreateNestedManyWithoutEventInputSchema';
import { CancellationPolicyRuleCreateNestedManyWithoutEventInputSchema } from './CancellationPolicyRuleCreateNestedManyWithoutEventInputSchema';
import { EventTranslationCreateNestedManyWithoutEventInputSchema } from './EventTranslationCreateNestedManyWithoutEventInputSchema';

export const EventCreateWithoutOccurrencesInputSchema: z.ZodType<Prisma.EventCreateWithoutOccurrencesInput> = z.strictObject({
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
  category: z.lazy(() => CategoryCreateNestedOneWithoutEventsInputSchema),
  images: z.lazy(() => EventImageCreateNestedManyWithoutEventInputSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleCreateNestedManyWithoutEventInputSchema).optional(),
  translations: z.lazy(() => EventTranslationCreateNestedManyWithoutEventInputSchema).optional(),
});

export default EventCreateWithoutOccurrencesInputSchema;
