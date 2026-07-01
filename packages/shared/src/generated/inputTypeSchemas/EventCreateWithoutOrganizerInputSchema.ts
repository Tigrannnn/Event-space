import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { CategoryCreateNestedOneWithoutEventsInputSchema } from './CategoryCreateNestedOneWithoutEventsInputSchema';
import { EventOccurrenceCreateNestedManyWithoutEventInputSchema } from './EventOccurrenceCreateNestedManyWithoutEventInputSchema';
import { EventImageCreateNestedManyWithoutEventInputSchema } from './EventImageCreateNestedManyWithoutEventInputSchema';
import { CancellationPolicyRuleCreateNestedManyWithoutEventInputSchema } from './CancellationPolicyRuleCreateNestedManyWithoutEventInputSchema';
import { EventTranslationCreateNestedManyWithoutEventInputSchema } from './EventTranslationCreateNestedManyWithoutEventInputSchema';

export const EventCreateWithoutOrganizerInputSchema: z.ZodType<Prisma.EventCreateWithoutOrganizerInput> = z.object({
  id: z.uuid().optional(),
  locationUrl: z.string().optional().nullable(),
  difficulty: z.lazy(() => EventDifficultySchema).optional().nullable(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  duration: z.number().int(),
  status: z.lazy(() => EventStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  category: z.lazy(() => CategoryCreateNestedOneWithoutEventsInputSchema),
  occurrences: z.lazy(() => EventOccurrenceCreateNestedManyWithoutEventInputSchema).optional(),
  images: z.lazy(() => EventImageCreateNestedManyWithoutEventInputSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleCreateNestedManyWithoutEventInputSchema).optional(),
  translations: z.lazy(() => EventTranslationCreateNestedManyWithoutEventInputSchema).optional(),
}).strict();

export default EventCreateWithoutOrganizerInputSchema;
