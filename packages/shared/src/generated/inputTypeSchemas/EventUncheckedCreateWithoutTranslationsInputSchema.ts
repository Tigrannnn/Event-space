import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { EventOccurrenceUncheckedCreateNestedManyWithoutEventInputSchema } from './EventOccurrenceUncheckedCreateNestedManyWithoutEventInputSchema';
import { EventImageUncheckedCreateNestedManyWithoutEventInputSchema } from './EventImageUncheckedCreateNestedManyWithoutEventInputSchema';
import { CancellationPolicyRuleUncheckedCreateNestedManyWithoutEventInputSchema } from './CancellationPolicyRuleUncheckedCreateNestedManyWithoutEventInputSchema';

export const EventUncheckedCreateWithoutTranslationsInputSchema: z.ZodType<Prisma.EventUncheckedCreateWithoutTranslationsInput> = z.strictObject({
  id: z.uuid().optional(),
  locationUrl: z.string(),
  meetingLocationUrl: z.string(),
  difficulty: z.lazy(() => EventDifficultySchema).optional().nullable(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  duration: z.number().int(),
  status: z.lazy(() => EventStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  userId: z.string(),
  categoryId: z.string(),
  occurrences: z.lazy(() => EventOccurrenceUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
  images: z.lazy(() => EventImageUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
});

export default EventUncheckedCreateWithoutTranslationsInputSchema;
