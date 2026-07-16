import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { EventDifficultySchema } from './EventDifficultySchema';
import { NullableEnumEventDifficultyFieldUpdateOperationsInputSchema } from './NullableEnumEventDifficultyFieldUpdateOperationsInputSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { DecimalFieldUpdateOperationsInputSchema } from './DecimalFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { EnumEventStatusFieldUpdateOperationsInputSchema } from './EnumEventStatusFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { EventOccurrenceUncheckedUpdateManyWithoutEventNestedInputSchema } from './EventOccurrenceUncheckedUpdateManyWithoutEventNestedInputSchema';
import { EventImageUncheckedUpdateManyWithoutEventNestedInputSchema } from './EventImageUncheckedUpdateManyWithoutEventNestedInputSchema';
import { CancellationPolicyRuleUncheckedUpdateManyWithoutEventNestedInputSchema } from './CancellationPolicyRuleUncheckedUpdateManyWithoutEventNestedInputSchema';
import { EventTranslationUncheckedUpdateManyWithoutEventNestedInputSchema } from './EventTranslationUncheckedUpdateManyWithoutEventNestedInputSchema';

export const EventUncheckedUpdateInputSchema: z.ZodType<Prisma.EventUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  locationUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  difficulty: z.union([ z.lazy(() => EventDifficultySchema), z.lazy(() => NullableEnumEventDifficultyFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  duration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => EventStatusSchema), z.lazy(() => EnumEventStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  occurrences: z.lazy(() => EventOccurrenceUncheckedUpdateManyWithoutEventNestedInputSchema).optional(),
  images: z.lazy(() => EventImageUncheckedUpdateManyWithoutEventNestedInputSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleUncheckedUpdateManyWithoutEventNestedInputSchema).optional(),
  translations: z.lazy(() => EventTranslationUncheckedUpdateManyWithoutEventNestedInputSchema).optional(),
});

export default EventUncheckedUpdateInputSchema;
