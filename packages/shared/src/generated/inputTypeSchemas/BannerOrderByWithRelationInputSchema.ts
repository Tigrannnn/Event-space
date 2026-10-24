import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { EventOrderByWithRelationInputSchema } from './EventOrderByWithRelationInputSchema';
import { CategoryOrderByWithRelationInputSchema } from './CategoryOrderByWithRelationInputSchema';
import { BannerTranslationOrderByRelationAggregateInputSchema } from './BannerTranslationOrderByRelationAggregateInputSchema';

export const BannerOrderByWithRelationInputSchema: z.ZodType<Prisma.BannerOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  imagePublicId: z.lazy(() => SortOrderSchema).optional(),
  imageMobileUrl: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  imageMobilePublicId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  sortOrder: z.lazy(() => SortOrderSchema).optional(),
  startsAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  endsAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  targetType: z.lazy(() => SortOrderSchema).optional(),
  eventId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  categoryId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  url: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  textAlign: z.lazy(() => SortOrderSchema).optional(),
  theme: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  event: z.lazy(() => EventOrderByWithRelationInputSchema).optional(),
  category: z.lazy(() => CategoryOrderByWithRelationInputSchema).optional(),
  translations: z.lazy(() => BannerTranslationOrderByRelationAggregateInputSchema).optional(),
});

export default BannerOrderByWithRelationInputSchema;
