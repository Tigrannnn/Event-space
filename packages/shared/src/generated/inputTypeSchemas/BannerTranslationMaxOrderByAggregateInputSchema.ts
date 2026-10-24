import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BannerTranslationMaxOrderByAggregateInputSchema: z.ZodType<Prisma.BannerTranslationMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  bannerId: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  subtitle: z.lazy(() => SortOrderSchema).optional(),
  ctaLabel: z.lazy(() => SortOrderSchema).optional(),
});

export default BannerTranslationMaxOrderByAggregateInputSchema;
