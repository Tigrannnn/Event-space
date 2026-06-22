import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { EventTranslationCountOrderByAggregateInputSchema } from './EventTranslationCountOrderByAggregateInputSchema';
import { EventTranslationMaxOrderByAggregateInputSchema } from './EventTranslationMaxOrderByAggregateInputSchema';
import { EventTranslationMinOrderByAggregateInputSchema } from './EventTranslationMinOrderByAggregateInputSchema';

export const EventTranslationOrderByWithAggregationInputSchema: z.ZodType<Prisma.EventTranslationOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  eventId: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  location: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  whatsIncluded: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => EventTranslationCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => EventTranslationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => EventTranslationMinOrderByAggregateInputSchema).optional(),
}).strict();

export default EventTranslationOrderByWithAggregationInputSchema;
