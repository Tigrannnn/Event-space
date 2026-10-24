import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { EventDifficultySchema } from './EventDifficultySchema';
import { EnumEventDifficultyFieldUpdateOperationsInputSchema } from './EnumEventDifficultyFieldUpdateOperationsInputSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { DecimalFieldUpdateOperationsInputSchema } from './DecimalFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { EnumEventStatusFieldUpdateOperationsInputSchema } from './EnumEventStatusFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { EventOccurrenceUncheckedUpdateManyWithoutEventNestedInputSchema } from './EventOccurrenceUncheckedUpdateManyWithoutEventNestedInputSchema';
import { EventImageUncheckedUpdateManyWithoutEventNestedInputSchema } from './EventImageUncheckedUpdateManyWithoutEventNestedInputSchema';
import { FavoriteUncheckedUpdateManyWithoutEventNestedInputSchema } from './FavoriteUncheckedUpdateManyWithoutEventNestedInputSchema';
import { BannerUncheckedUpdateManyWithoutEventNestedInputSchema } from './BannerUncheckedUpdateManyWithoutEventNestedInputSchema';
import { ReviewUncheckedUpdateManyWithoutEventNestedInputSchema } from './ReviewUncheckedUpdateManyWithoutEventNestedInputSchema';
import { CancellationPolicyRuleUncheckedUpdateManyWithoutEventNestedInputSchema } from './CancellationPolicyRuleUncheckedUpdateManyWithoutEventNestedInputSchema';

export const EventUncheckedUpdateWithoutTranslationsInputSchema: z.ZodType<Prisma.EventUncheckedUpdateWithoutTranslationsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  locationUrl: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  meetingLocationUrl: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  difficulty: z.union([ z.lazy(() => EventDifficultySchema), z.lazy(() => EnumEventDifficultyFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  duration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => EventStatusSchema), z.lazy(() => EnumEventStatusFieldUpdateOperationsInputSchema) ]).optional(),
  ratingSum: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  ratingCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  occurrences: z.lazy(() => EventOccurrenceUncheckedUpdateManyWithoutEventNestedInputSchema).optional(),
  images: z.lazy(() => EventImageUncheckedUpdateManyWithoutEventNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedUpdateManyWithoutEventNestedInputSchema).optional(),
  banners: z.lazy(() => BannerUncheckedUpdateManyWithoutEventNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutEventNestedInputSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleUncheckedUpdateManyWithoutEventNestedInputSchema).optional(),
});

export default EventUncheckedUpdateWithoutTranslationsInputSchema;
