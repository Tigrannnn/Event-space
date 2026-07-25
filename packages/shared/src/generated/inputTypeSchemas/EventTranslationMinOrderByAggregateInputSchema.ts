import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const EventTranslationMinOrderByAggregateInputSchema: z.ZodType<Prisma.EventTranslationMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  eventId: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  location: z.lazy(() => SortOrderSchema).optional(),
  meetingLocation: z.lazy(() => SortOrderSchema).optional(),
});

export default EventTranslationMinOrderByAggregateInputSchema;
