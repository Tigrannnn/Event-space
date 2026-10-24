import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { EnumBannerStatusWithAggregatesFilterSchema } from './EnumBannerStatusWithAggregatesFilterSchema';
import { BannerStatusSchema } from './BannerStatusSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';
import { EnumBannerTargetTypeWithAggregatesFilterSchema } from './EnumBannerTargetTypeWithAggregatesFilterSchema';
import { BannerTargetTypeSchema } from './BannerTargetTypeSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { EnumBannerTextAlignWithAggregatesFilterSchema } from './EnumBannerTextAlignWithAggregatesFilterSchema';
import { BannerTextAlignSchema } from './BannerTextAlignSchema';
import { EnumBannerThemeWithAggregatesFilterSchema } from './EnumBannerThemeWithAggregatesFilterSchema';
import { BannerThemeSchema } from './BannerThemeSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const BannerScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.BannerScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => BannerScalarWhereWithAggregatesInputSchema), z.lazy(() => BannerScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => BannerScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BannerScalarWhereWithAggregatesInputSchema), z.lazy(() => BannerScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  imageUrl: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  imagePublicId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumBannerStatusWithAggregatesFilterSchema), z.lazy(() => BannerStatusSchema) ]).optional(),
  sortOrder: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  startsAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
  endsAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
  targetType: z.union([ z.lazy(() => EnumBannerTargetTypeWithAggregatesFilterSchema), z.lazy(() => BannerTargetTypeSchema) ]).optional(),
  eventId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  categoryId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  url: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  textAlign: z.union([ z.lazy(() => EnumBannerTextAlignWithAggregatesFilterSchema), z.lazy(() => BannerTextAlignSchema) ]).optional(),
  theme: z.union([ z.lazy(() => EnumBannerThemeWithAggregatesFilterSchema), z.lazy(() => BannerThemeSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export default BannerScalarWhereWithAggregatesInputSchema;
