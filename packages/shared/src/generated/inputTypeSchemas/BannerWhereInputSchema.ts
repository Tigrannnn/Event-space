import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumBannerStatusFilterSchema } from './EnumBannerStatusFilterSchema';
import { BannerStatusSchema } from './BannerStatusSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { EnumBannerTargetTypeFilterSchema } from './EnumBannerTargetTypeFilterSchema';
import { BannerTargetTypeSchema } from './BannerTargetTypeSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { EnumBannerTextAlignFilterSchema } from './EnumBannerTextAlignFilterSchema';
import { BannerTextAlignSchema } from './BannerTextAlignSchema';
import { EnumBannerThemeFilterSchema } from './EnumBannerThemeFilterSchema';
import { BannerThemeSchema } from './BannerThemeSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { EventNullableScalarRelationFilterSchema } from './EventNullableScalarRelationFilterSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { CategoryNullableScalarRelationFilterSchema } from './CategoryNullableScalarRelationFilterSchema';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';
import { BannerTranslationListRelationFilterSchema } from './BannerTranslationListRelationFilterSchema';

export const BannerWhereInputSchema: z.ZodType<Prisma.BannerWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => BannerWhereInputSchema), z.lazy(() => BannerWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BannerWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BannerWhereInputSchema), z.lazy(() => BannerWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  imageUrl: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  imagePublicId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumBannerStatusFilterSchema), z.lazy(() => BannerStatusSchema) ]).optional(),
  sortOrder: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  startsAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  endsAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  targetType: z.union([ z.lazy(() => EnumBannerTargetTypeFilterSchema), z.lazy(() => BannerTargetTypeSchema) ]).optional(),
  eventId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  categoryId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  url: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  textAlign: z.union([ z.lazy(() => EnumBannerTextAlignFilterSchema), z.lazy(() => BannerTextAlignSchema) ]).optional(),
  theme: z.union([ z.lazy(() => EnumBannerThemeFilterSchema), z.lazy(() => BannerThemeSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  event: z.union([ z.lazy(() => EventNullableScalarRelationFilterSchema), z.lazy(() => EventWhereInputSchema) ]).optional().nullable(),
  category: z.union([ z.lazy(() => CategoryNullableScalarRelationFilterSchema), z.lazy(() => CategoryWhereInputSchema) ]).optional().nullable(),
  translations: z.lazy(() => BannerTranslationListRelationFilterSchema).optional(),
});

export default BannerWhereInputSchema;
