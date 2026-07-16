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
import { UserUpdateOneRequiredWithoutEventsNestedInputSchema } from './UserUpdateOneRequiredWithoutEventsNestedInputSchema';
import { CategoryUpdateOneRequiredWithoutEventsNestedInputSchema } from './CategoryUpdateOneRequiredWithoutEventsNestedInputSchema';
import { EventOccurrenceUpdateManyWithoutEventNestedInputSchema } from './EventOccurrenceUpdateManyWithoutEventNestedInputSchema';
import { EventImageUpdateManyWithoutEventNestedInputSchema } from './EventImageUpdateManyWithoutEventNestedInputSchema';
import { EventTranslationUpdateManyWithoutEventNestedInputSchema } from './EventTranslationUpdateManyWithoutEventNestedInputSchema';

export const EventUpdateWithoutCancellationRulesInputSchema: z.ZodType<Prisma.EventUpdateWithoutCancellationRulesInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  locationUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  difficulty: z.union([ z.lazy(() => EventDifficultySchema), z.lazy(() => NullableEnumEventDifficultyFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  duration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => EventStatusSchema), z.lazy(() => EnumEventStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  organizer: z.lazy(() => UserUpdateOneRequiredWithoutEventsNestedInputSchema).optional(),
  category: z.lazy(() => CategoryUpdateOneRequiredWithoutEventsNestedInputSchema).optional(),
  occurrences: z.lazy(() => EventOccurrenceUpdateManyWithoutEventNestedInputSchema).optional(),
  images: z.lazy(() => EventImageUpdateManyWithoutEventNestedInputSchema).optional(),
  translations: z.lazy(() => EventTranslationUpdateManyWithoutEventNestedInputSchema).optional(),
});

export default EventUpdateWithoutCancellationRulesInputSchema;
