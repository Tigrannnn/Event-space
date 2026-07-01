import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { EventOccurrenceUncheckedCreateNestedManyWithoutEventInputSchema } from './EventOccurrenceUncheckedCreateNestedManyWithoutEventInputSchema';
import { EventImageUncheckedCreateNestedManyWithoutEventInputSchema } from './EventImageUncheckedCreateNestedManyWithoutEventInputSchema';
import { CancellationPolicyRuleUncheckedCreateNestedManyWithoutEventInputSchema } from './CancellationPolicyRuleUncheckedCreateNestedManyWithoutEventInputSchema';
import { EventTranslationUncheckedCreateNestedManyWithoutEventInputSchema } from './EventTranslationUncheckedCreateNestedManyWithoutEventInputSchema';

export const EventUncheckedCreateWithoutOrganizerInputSchema: z.ZodType<Prisma.EventUncheckedCreateWithoutOrganizerInput> = z.object({
  id: z.uuid().optional(),
  locationUrl: z.string().optional().nullable(),
  difficulty: z.lazy(() => EventDifficultySchema).optional().nullable(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  duration: z.number().int(),
  status: z.lazy(() => EventStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  categoryId: z.string(),
  occurrences: z.lazy(() => EventOccurrenceUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
  images: z.lazy(() => EventImageUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
  translations: z.lazy(() => EventTranslationUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
}).strict();

export default EventUncheckedCreateWithoutOrganizerInputSchema;
