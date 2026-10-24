import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { BannerOrderByWithRelationInputSchema } from './BannerOrderByWithRelationInputSchema';

export const BannerTranslationOrderByWithRelationInputSchema: z.ZodType<Prisma.BannerTranslationOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  bannerId: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  subtitle: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  ctaLabel: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  banner: z.lazy(() => BannerOrderByWithRelationInputSchema).optional(),
});

export default BannerTranslationOrderByWithRelationInputSchema;
