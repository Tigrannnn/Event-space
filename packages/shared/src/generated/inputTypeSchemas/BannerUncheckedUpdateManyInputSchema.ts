import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { BannerStatusSchema } from './BannerStatusSchema';
import { EnumBannerStatusFieldUpdateOperationsInputSchema } from './EnumBannerStatusFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { BannerTargetTypeSchema } from './BannerTargetTypeSchema';
import { EnumBannerTargetTypeFieldUpdateOperationsInputSchema } from './EnumBannerTargetTypeFieldUpdateOperationsInputSchema';
import { BannerTextAlignSchema } from './BannerTextAlignSchema';
import { EnumBannerTextAlignFieldUpdateOperationsInputSchema } from './EnumBannerTextAlignFieldUpdateOperationsInputSchema';
import { BannerThemeSchema } from './BannerThemeSchema';
import { EnumBannerThemeFieldUpdateOperationsInputSchema } from './EnumBannerThemeFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';

export const BannerUncheckedUpdateManyInputSchema: z.ZodType<Prisma.BannerUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrl: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imagePublicId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageMobileUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageMobilePublicId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => BannerStatusSchema), z.lazy(() => EnumBannerStatusFieldUpdateOperationsInputSchema) ]).optional(),
  sortOrder: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  startsAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  endsAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  targetType: z.union([ z.lazy(() => BannerTargetTypeSchema), z.lazy(() => EnumBannerTargetTypeFieldUpdateOperationsInputSchema) ]).optional(),
  eventId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  categoryId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  textAlign: z.union([ z.lazy(() => BannerTextAlignSchema), z.lazy(() => EnumBannerTextAlignFieldUpdateOperationsInputSchema) ]).optional(),
  theme: z.union([ z.lazy(() => BannerThemeSchema), z.lazy(() => EnumBannerThemeFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export default BannerUncheckedUpdateManyInputSchema;
