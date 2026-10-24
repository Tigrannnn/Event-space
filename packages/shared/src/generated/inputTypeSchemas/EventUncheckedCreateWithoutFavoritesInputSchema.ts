import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { EventOccurrenceUncheckedCreateNestedManyWithoutEventInputSchema } from './EventOccurrenceUncheckedCreateNestedManyWithoutEventInputSchema';
import { EventImageUncheckedCreateNestedManyWithoutEventInputSchema } from './EventImageUncheckedCreateNestedManyWithoutEventInputSchema';
import { BannerUncheckedCreateNestedManyWithoutEventInputSchema } from './BannerUncheckedCreateNestedManyWithoutEventInputSchema';
import { ReviewUncheckedCreateNestedManyWithoutEventInputSchema } from './ReviewUncheckedCreateNestedManyWithoutEventInputSchema';
import { CancellationPolicyRuleUncheckedCreateNestedManyWithoutEventInputSchema } from './CancellationPolicyRuleUncheckedCreateNestedManyWithoutEventInputSchema';
import { EventTranslationUncheckedCreateNestedManyWithoutEventInputSchema } from './EventTranslationUncheckedCreateNestedManyWithoutEventInputSchema';

export const EventUncheckedCreateWithoutFavoritesInputSchema: z.ZodType<Prisma.EventUncheckedCreateWithoutFavoritesInput> = z.strictObject({
  id: z.uuid().optional(),
  locationUrl: z.string(),
  meetingLocationUrl: z.string(),
  difficulty: z.lazy(() => EventDifficultySchema).optional(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  duration: z.number().int(),
  status: z.lazy(() => EventStatusSchema).optional(),
  ratingSum: z.number().int().optional(),
  ratingCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  userId: z.string(),
  categoryId: z.string(),
  occurrences: z.lazy(() => EventOccurrenceUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
  images: z.lazy(() => EventImageUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
  banners: z.lazy(() => BannerUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
  translations: z.lazy(() => EventTranslationUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
});

export default EventUncheckedCreateWithoutFavoritesInputSchema;
